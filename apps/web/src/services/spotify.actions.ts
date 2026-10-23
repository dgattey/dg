'use server';

import type { Track } from '@dg/content-models/spotify/Track';
import { getLatestSong } from './spotify';
import { scheduleSpotifySyncIfStale } from './spotifySync';

export async function loadLatestSong(): Promise<Track | null> {
  const track = await getLatestSong();
  scheduleSpotifySyncIfStale(track);
  return track;
}
