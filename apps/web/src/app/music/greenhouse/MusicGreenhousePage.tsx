import 'server-only';

import { musicRoute } from '@dg/shared-core/routes/app';
import { GreenhouseTypeProvider } from '@dg/ui/theme/GreenhouseTypeProvider';
import { Suspense } from 'react';
import { getFavoriteAlbums } from '../../../services/albums';
import { getMusicHistory } from '../../../services/music';
import { musicDestinationLabel } from '../../layouts/musicHeaderDestinations';
import { PageTitle } from '../../layouts/PageTitle';
import { MusicGreenhouseGrid } from './MusicGreenhouseGrid';
import { NowPlayingSlot } from './NowPlayingSlot';
import { OnRepeatCard } from './OnRepeatCard';
import { rankAlbums, rankArtists, rankTracks } from './rankMusic';
import { TopArtistsCard } from './TopArtistsCard';
import { TopTracksCard } from './TopTracksCard';
import type { MusicGreenhouseFixture } from './types';

const TITLE = musicDestinationLabel(musicRoute);

async function MusicGreenhouseSlots({ fixture }: { fixture?: MusicGreenhouseFixture }) {
  if (fixture) {
    return (
      <MusicGreenhouseGrid>
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
      <PageTitle>{TITLE}</PageTitle>
      <Suspense fallback={null}>
        <MusicGreenhouseSlots fixture={fixture} />
      </Suspense>
    </GreenhouseTypeProvider>
  );
}
