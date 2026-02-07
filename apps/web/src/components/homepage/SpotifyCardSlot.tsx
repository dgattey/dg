import 'server-only';

import { Suspense } from 'react';
import { getLatestSong } from '../../services/spotify';
import { SpotifyCardScrollTracker } from '../spotify/SpotifyCardScrollTracker';
import { SpotifyCard, SpotifyCardLoading } from './SpotifyCard';

async function SpotifyCardContent() {
  const track = await getLatestSong();
  return (
    <SpotifyCardScrollTracker>
      <SpotifyCard track={track} />
    </SpotifyCardScrollTracker>
  );
}

export function SpotifyCardSlot() {
  return (
    <Suspense fallback={<SpotifyCardLoading />}>
      <SpotifyCardContent />
    </Suspense>
  );
}
