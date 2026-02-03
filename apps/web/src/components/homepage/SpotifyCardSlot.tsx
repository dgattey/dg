import 'server-only';

import { isMissingTokenError } from '@dg/services/clients/MissingTokenError';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getLatestSong } from '../../services/spotify';
import { SpotifyCard, SpotifyCardLoading } from './SpotifyCard';

async function SpotifyCardContent() {
  try {
    const track = await getLatestSong();
    return <SpotifyCard track={track} />;
  } catch (error) {
    // In development, redirect to the dev page to set up OAuth
    if (isMissingTokenError(error) && process.env.NODE_ENV === 'development') {
      redirect('/dev');
    }
    throw error;
  }
}

export function SpotifyCardSlot() {
  return (
    <Suspense fallback={<SpotifyCardLoading />}>
      <SpotifyCardContent />
    </Suspense>
  );
}
