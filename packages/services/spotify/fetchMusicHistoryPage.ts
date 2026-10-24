import 'server-only';

import { db, Op } from '@dg/db';
import { SITE_TIME_ZONE } from '@dg/shared-core/dates/periodStatus';
import { isNotNullish } from '@dg/shared-core/types/typeguards';
import { selectArtistFirstPlays } from './listeningStatsQueries';
import { resolveTrackDisplays } from './trackDisplays';

export type HistoryTrack = {
  albumId: string;
  albumImageUrl: string;
  albumName: string;
  /** Spotify album page, empty when we never captured one. */
  albumUrl: string;
  artistNames: string;
  /** `New artist this week|month|year` when one of the track's artists was first played then. */
  newArtist: string | null;
  playedAt: string;
  trackId: string;
  trackName: string;
  url: string;
};

type MusicHistoryPage = {
  tracks: Array<HistoryTrack>;
  nextCursor: string | null;
};

type MusicHistoryPageOptions = {
  before?: Date;
  pageSize?: number;
};

type SpotifyHistoryRow = {
  playedAt: Date;
  trackId: string;
};

const DEFAULT_PAGE_SIZE = 24;

const pacificDayFormat = new Intl.DateTimeFormat('en-CA', { timeZone: SITE_TIME_ZONE });

/** The Pacific calendar day as `YYYY-MM-DD`, then the Monday that starts its week. */
function pacificCalendar(date: Date) {
  const day = pacificDayFormat.format(date);
  const noon = new Date(`${day}T12:00:00Z`);
  const mondayOffset = (noon.getUTCDay() + 6) % 7;
  const monday = new Date(noon.getTime() - mondayOffset * 86_400_000).toISOString().slice(0, 10);
  return { day, monday };
}

/** Matches the history's own `This week` and `This month` sections, so the badge reads with them. */
function newArtistLabel(firstPlayedAt: Date, now: Date): string | null {
  const first = pacificCalendar(firstPlayedAt);
  const today = pacificCalendar(now);
  if (first.monday === today.monday) return 'New artist this week';
  if (first.day.slice(0, 7) === today.day.slice(0, 7)) return 'New artist this month';
  if (first.day.slice(0, 4) === today.day.slice(0, 4)) return 'New artist this year';
  return null;
}

/**
 * Fetches SpotifyPlay rows from the database.
 */
function fetchSpotifyPlayRows({
  before,
  pageSize = DEFAULT_PAGE_SIZE,
}: MusicHistoryPageOptions): Promise<Array<SpotifyHistoryRow>> {
  const whereClause = before ? { playedAt: { [Op.lt]: before } } : {};
  return db.SpotifyPlay.findAll({
    attributes: ['playedAt', 'trackId'],
    limit: pageSize + 1,
    order: [['playedAt', 'DESC']],
    where: whereClause,
  });
}

/**
 * Fetches a page of music history with efficient caching.
 *
 * Reads a page of SpotifyPlay rows, then resolves each track through the
 * Music* cache (fetching and writing through any misses).
 */
export async function fetchMusicHistoryPage({
  before,
  pageSize = DEFAULT_PAGE_SIZE,
}: MusicHistoryPageOptions): Promise<MusicHistoryPage> {
  const plays = await fetchSpotifyPlayRows({ before, pageSize });

  const hasMore = plays.length > pageSize;
  const pageItems = plays.slice(0, pageSize);
  const lastPlayedAt = pageItems[pageItems.length - 1]?.playedAt;
  const nextCursor = hasMore && lastPlayedAt ? lastPlayedAt.toISOString() : null;

  if (pageItems.length === 0) {
    return { nextCursor: null, tracks: [] };
  }

  const displays = await resolveTrackDisplays(pageItems.map((play) => play.trackId));
  const now = new Date();
  const artistIds = [...displays.values()].flatMap((display) =>
    display.artists.map((artist) => artist.id),
  );
  const firstPlays = new Map(
    (await selectArtistFirstPlays([...new Set(artistIds)])).map((row) => [
      row.artistId,
      row.playedAt,
    ]),
  );

  const tracks = pageItems
    .map((play) => {
      const display = displays.get(play.trackId);
      if (!display) {
        return null;
      }
      const newestFirstPlay = Math.max(
        ...display.artists.map((artist) => firstPlays.get(artist.id)?.getTime() ?? 0),
      );
      return {
        albumId: display.album.id,
        albumImageUrl: display.album.imageUrl,
        albumName: display.album.name,
        albumUrl: display.album.url,
        artistNames: display.artists.map((artist) => artist.name).join(', '),
        newArtist: newestFirstPlay > 0 ? newArtistLabel(new Date(newestFirstPlay), now) : null,
        playedAt: play.playedAt.toISOString(),
        trackId: display.id,
        trackName: display.name,
        url: display.url,
      };
    })
    .filter(isNotNullish);

  return { nextCursor, tracks };
}
