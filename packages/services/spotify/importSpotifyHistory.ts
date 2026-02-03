import 'server-only';

import { db } from '@dg/db';
import { log } from '@dg/shared-core/helpers/log';
import { serializeError } from '@dg/shared-core/helpers/serializeError';
import * as v from 'valibot';
import { spotifyClient } from './spotifyClient';

// Schema for Spotify GDPR StreamingHistory JSON entries.
const spotifyStreamingHistorySchema = v.array(
  v.object({
    artistName: v.string(),
    endTime: v.string(),
    msPlayed: v.number(),
    trackName: v.string(),
  }),
);

const searchResponseSchema = v.looseObject({
  tracks: v.looseObject({
    items: v.array(
      v.looseObject({
        album: v.looseObject({ id: v.string() }),
        artists: v.array(v.looseObject({ id: v.string(), name: v.string() })),
        id: v.string(),
        name: v.string(),
      }),
    ),
  }),
});

type TrackLookup = { trackId: string; albumId: string; artistIds: Array<string> };

async function searchTrack(artistName: string, trackName: string): Promise<TrackLookup | null> {
  const query = encodeURIComponent(`track:${trackName} artist:${artistName}`);
  const resource = `search?q=${query}&type=track&limit=1`;

  const { response, status } = await spotifyClient.get(resource);
  if (status !== 200) {
    return null;
  }

  const data = v.parse(searchResponseSchema, await response.json());
  const track = data.tracks.items[0];

  if (!track) {
    return null;
  }

  const artistMatch = track.artists.some(
    (artist) => artist.name.toLowerCase() === artistName.toLowerCase(),
  );
  if (!artistMatch) {
    log.warn('Artist mismatch in search result', {
      found: track.artists.map((artist) => artist.name),
      searched: artistName,
    });
  }

  return {
    albumId: track.album.id,
    artistIds: track.artists.map((artist) => artist.id),
    trackId: track.id,
  };
}

function parseStreamingHistoryTimestamp(endTime: string): Date {
  const [datePart, timePart] = endTime.split(' ');
  return new Date(`${datePart}T${timePart}:00Z`);
}

const trackCache = new Map<string, TrackLookup | null>();

type ImportSpotifyHistoryOptions = {
  dryRun?: boolean;
};

/**
 * Imports Spotify listening history from a GDPR StreamingHistory export.
 */
export async function importSpotifyHistory(
  entries: unknown,
  options: ImportSpotifyHistoryOptions = {},
): Promise<{ imported: number; notFound: number; errors: number }> {
  const { dryRun = false } = options;
  const parsed = v.parse(spotifyStreamingHistorySchema, entries);

  log.info('Starting Spotify history import', {
    dryRun,
    totalEntries: parsed.length,
  });

  let imported = 0;
  let notFound = 0;
  let errors = 0;

  const rows: Array<{
    playedAt: Date;
    trackId: string;
    albumId: string;
    artistIds: Array<string>;
  }> = [];

  for (const entry of parsed) {
    const cacheKey = `${entry.artistName}|||${entry.trackName}`;
    let trackInfo = trackCache.get(cacheKey);

    if (trackInfo === undefined) {
      try {
        trackInfo = await searchTrack(entry.artistName, entry.trackName);
        trackCache.set(cacheKey, trackInfo);
        await new Promise((resolve) => setTimeout(resolve, 350));
      } catch (error) {
        log.warn('Spotify search failed', { entry, error: serializeError(error) });
        trackCache.set(cacheKey, null);
        errors += 1;
        continue;
      }
    }

    if (!trackInfo) {
      notFound += 1;
      continue;
    }

    rows.push({
      albumId: trackInfo.albumId,
      artistIds: trackInfo.artistIds,
      playedAt: parseStreamingHistoryTimestamp(entry.endTime),
      trackId: trackInfo.trackId,
    });
  }

  if (dryRun) {
    log.info('Spotify history dry run complete', { errors, notFound, wouldImport: rows.length });
    return { errors, imported: rows.length, notFound };
  }

  if (rows.length > 0) {
    // Count before insert to get accurate inserted count
    // (bulkCreate with ignoreDuplicates doesn't reliably set isNewRecord)
    const countBefore = await db.SpotifyPlay.count();

    await db.SpotifyPlay.bulkCreate(rows, {
      ignoreDuplicates: true,
    });

    const countAfter = await db.SpotifyPlay.count();
    imported = countAfter - countBefore;
  }

  log.info('Spotify history import complete', { errors, imported, notFound });
  return { errors, imported, notFound };
}
