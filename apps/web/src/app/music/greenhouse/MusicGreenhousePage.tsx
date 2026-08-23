import 'server-only';

import { GreenhouseTypeProvider } from '@dg/ui/theme/GreenhouseTypeProvider';
import { Suspense } from 'react';
import { getFavoriteAlbums } from '../../../services/albums';
import { getMusicHistory } from '../../../services/music';
import { ListeningHeading } from './ListeningHeading';
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
      <MusicGreenhouseGrid>
        <ListeningHeading description={LISTENING_DESCRIPTION} title="Listening" />
        <NowPlayingSlot fixture={fixture.nowPlaying} />
        <OnRepeatCard albums={fixture.albums ?? []} />
        <TopTracksCard tracks={fixture.tracks ?? []} />
        <TopArtistsCard artists={fixture.artists ?? []} />
      </MusicGreenhouseGrid>
    );
  }

  let historyTracks: Awaited<ReturnType<typeof getMusicHistory>>['tracks'] = [];
  let favorites: Awaited<ReturnType<typeof getFavoriteAlbums>> = [];

  try {
    const history = await getMusicHistory({});
    historyTracks = history.tracks;
  } catch {
    historyTracks = [];
  }

  try {
    favorites = (await getFavoriteAlbums()) ?? [];
  } catch {
    favorites = [];
  }

  return (
    <MusicGreenhouseGrid>
      <ListeningHeading description={LISTENING_DESCRIPTION} title="Listening" />
      <NowPlayingSlot />
      <OnRepeatCard albums={rankAlbums(historyTracks, favorites)} />
      <TopTracksCard tracks={rankTracks(historyTracks)} />
      <TopArtistsCard artists={rankArtists(historyTracks)} />
    </MusicGreenhouseGrid>
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
