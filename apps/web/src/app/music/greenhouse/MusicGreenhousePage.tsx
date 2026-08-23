import 'server-only';

import { GreenhouseTypeProvider } from '@dg/ui/theme/GreenhouseTypeProvider';
import { Suspense } from 'react';
import { getFavoriteAlbums } from '../../../services/albums';
import { getMusicHistory } from '../../../services/music';
import { ListeningHeading } from './ListeningHeading';
import { ListeningHistoryCard } from './ListeningHistoryCard';
import { MusicGreenhouseGrid } from './MusicGreenhouseGrid';
import { NowPlayingSlot } from './NowPlayingSlot';
import { OnRepeatCard } from './OnRepeatCard';
import { rankAlbums, rankArtists, rankTracks } from './rankMusic';
import { TopArtistsCard } from './TopArtistsCard';
import { TopTracksCard } from './TopTracksCard';
import type { MusicGreenhouseFixture } from './types';

const LISTENING_DESCRIPTION = 'Recent Spotify plays, stacked the way they sound.';

async function MusicGreenhouseSlots({ fixture }: { fixture?: MusicGreenhouseFixture }) {
  if (fixture) {
    return (
      <MusicGreenhouseGrid
        albums={<OnRepeatCard albums={fixture.albums ?? []} />}
        artists={<TopArtistsCard artists={fixture.artists ?? []} />}
        history={
          <ListeningHistoryCard
            initialCursor={fixture.historyCursor ?? null}
            initialTracks={fixture.historyTracks ?? []}
          />
        }
        intro={<ListeningHeading description={LISTENING_DESCRIPTION} title="Listening" />}
        nowPlaying={<NowPlayingSlot fixture={fixture.nowPlaying} />}
        tracks={<TopTracksCard tracks={fixture.tracks ?? []} />}
      />
    );
  }

  let historyTracks: Awaited<ReturnType<typeof getMusicHistory>>['tracks'] = [];
  let historyCursor: Awaited<ReturnType<typeof getMusicHistory>>['nextCursor'] = null;
  let favorites: Awaited<ReturnType<typeof getFavoriteAlbums>> = [];

  try {
    const history = await getMusicHistory({});
    historyTracks = history.tracks;
    historyCursor = history.nextCursor;
  } catch {
    historyTracks = [];
    historyCursor = null;
  }

  try {
    favorites = (await getFavoriteAlbums()) ?? [];
  } catch {
    favorites = [];
  }

  return (
    <MusicGreenhouseGrid
      albums={<OnRepeatCard albums={rankAlbums(historyTracks, favorites)} />}
      artists={<TopArtistsCard artists={rankArtists(historyTracks)} />}
      history={<ListeningHistoryCard initialCursor={historyCursor} initialTracks={historyTracks} />}
      intro={<ListeningHeading description={LISTENING_DESCRIPTION} title="Listening" />}
      nowPlaying={<NowPlayingSlot />}
      tracks={<TopTracksCard tracks={rankTracks(historyTracks)} />}
    />
  );
}

/**
 * Flag-on `/music` content. Route chrome is `GreenhouseSurface` on the page
 * (`surface="music"`). Preview photography wraps this in `GreenhouseFrame`.
 */
export function MusicGreenhousePage({ fixture }: { fixture?: MusicGreenhouseFixture } = {}) {
  return (
    <GreenhouseTypeProvider>
      <Suspense fallback={null}>
        <MusicGreenhouseSlots fixture={fixture} />
      </Suspense>
    </GreenhouseTypeProvider>
  );
}
