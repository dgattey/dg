import 'server-only';

import { musicRoute } from '@dg/shared-core/routes/app';
import type { Metadata } from 'next';
import { GreenhouseSurface } from '../greenhouse/GreenhouseSurface';
import { shouldUseGreenhouseChrome } from '../layouts/greenhouseChrome';
import { markdownAlternates } from '../layouts/markdownAlternates';
import { musicDestinationLabel } from '../layouts/musicHeaderDestinations';
import { FlagOffMusicPage } from './FlagOffMusicPage';
import { MusicGreenhousePage } from './greenhouse/MusicGreenhousePage';

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
 * Page shell stays synchronous so it commits in the same render as the
 * outgoing page. The flag check lives in a child; flag-off still returns
 * `FlagOffMusicPage` unchanged inside the chrome worker's surface wrap.
 */
export default function MusicPage() {
  return (
    <GreenhouseSurface surface="music">
      <MusicPageSwitch />
    </GreenhouseSurface>
  );
}
