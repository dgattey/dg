'use server';

import type { Track } from '@dg/content-models/spotify/Track';
import { getLatestSong } from './spotify';
import { scheduleSpotifySyncIfStale } from './spotifySync';

export async function loadLatestSong(): Promise<Track | null> {
  scheduleSpotifySyncIfStale();
  return await getLatestSong();
}
