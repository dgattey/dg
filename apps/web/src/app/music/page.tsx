import 'server-only';

import { musicRoute } from '@dg/shared-core/routes/app';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { GreenhouseSurface } from '../greenhouse/GreenhouseSurface';
import { shouldUseGreenhouseChrome } from '../layouts/greenhouseChrome';
import { markdownAlternates } from '../layouts/markdownAlternates';
import { musicDestinationLabel } from '../layouts/musicHeaderDestinations';
import { PageTitle } from '../layouts/PageTitle';
import { FlagOffMusicPage } from './FlagOffMusicPage';
import { MusicGreenhousePage } from './greenhouse/MusicGreenhousePage';
import { MusicHistorySkeleton } from './MusicHistorySkeleton';

const TITLE = musicDestinationLabel(musicRoute);

export const metadata: Metadata = {
  alternates: markdownAlternates(musicRoute),
  description: 'Recent tracks played on Spotify.',
  title: TITLE,
};

async function MusicPageSwitch() {
  if (await shouldUseGreenhouseChrome()) {
    return <MusicGreenhousePage />;
  }
  return <FlagOffMusicPage />;
}

/**
 * Static flag-off shell. Flag cookies stay behind the boundary so `/music`
 * can prerender under cacheComponents.
 */
function MusicPageFallback() {
  return (
    <>
      <PageTitle>{TITLE}</PageTitle>
      <MusicHistorySkeleton />
    </>
  );
}

/**
 * Page export stays synchronous. Flag evaluation (and the still-async
 * `GreenhouseSurface`) live inside Suspense; fallback is the flag-off chrome.
 */
export default function MusicPage() {
  return (
    <Suspense fallback={<MusicPageFallback />}>
      <GreenhouseSurface surface="music">
        <MusicPageSwitch />
      </GreenhouseSurface>
    </Suspense>
  );
}
