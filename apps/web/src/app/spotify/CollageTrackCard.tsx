import type { Track } from '@dg/content-models/spotify/Track';
import type { SxObject } from '@dg/ui/theme';
import type { CSSProperties } from 'react';
import { AlbumSleeve } from '../collage/AlbumSleeve';
import { PaperCard } from '../collage/PaperCard';
import { ALBUM_GRADIENT_GLOW_SX, AlbumGradientBackdrop } from './AlbumGradientBackdrop';
import { type Colors, getContrastingColors } from './colors';
import { TrackCardMeta } from './TrackCardMeta';

export const COLLAGE_TRACK_COLORS: Colors = {
  primary: 'var(--on)',
  primaryContrast: 'var(--pc)',
  primaryShadow: 'none',
  secondary: 'var(--soft)',
  secondaryShadow: 'none',
};

const gradientSurfaceSx: SxObject = {
  inset: 0,
  zIndex: -1,
};

const CARD_PAPER: CSSProperties & Record<`--${string}`, string> = {
  '--on': 'var(--mui-palette-text-primary)',
  '--pc': 'var(--mui-palette-background-paper)',
};

export function CollageTrackCard({ track }: { track: Track }) {
  const gradient = track.albumGradient;
  const colors = getContrastingColors(track);
  return (
    <div className="home__spotify" data-slot="sp">
      <AlbumSleeve track={track} />
      <div className="home__spotifyCard">
        <AlbumGradientBackdrop containerSx={ALBUM_GRADIENT_GLOW_SX} gradient={gradient} />
        <PaperCard
          className="home__spotifyMeta"
          edge="quad-b"
          innerClassName="home__spotifyMetaPaper"
          style={CARD_PAPER}
        >
          <AlbumGradientBackdrop containerSx={gradientSurfaceSx} gradient={gradient} />
          <div className="home__spotifyMetaInner">
            <TrackCardMeta colors={colors} service="Spotify" track={track} />
          </div>
        </PaperCard>
      </div>
    </div>
  );
}
