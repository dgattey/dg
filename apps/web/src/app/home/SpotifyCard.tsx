import 'server-only';

import { getLastKnownSong } from '../../services/spotify';
import { SpotifyCollageCard } from '../spotify/SpotifyCollageCard';

export async function SpotifyCardSlot() {
  const track = await getLastKnownSong();
  return <SpotifyCollageCard track={track} />;
}
