import 'server-only';

import { Suspense } from 'react';
import { getLatestSong } from '../../services/spotify';
import { SpotifyCard, SpotifyCardLoading } from './SpotifyCard';

async function SpotifyCardContent() {
  const track = await getLatestSong();
  return <SpotifyCard track={track} />;
}

export function SpotifyCardSlot() {
  return (
    <Suspense fallback={<SpotifyCardLoading />}>
      <SpotifyCardContent />
    </Suspense>
  );
}
