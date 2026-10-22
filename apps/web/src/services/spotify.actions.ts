'use server';

import type { Track } from '@dg/content-models/spotify/Track';
import { getLatestSong } from './spotify';

export async function loadLatestSong(): Promise<Track | null> {
  return await getLatestSong();
}
