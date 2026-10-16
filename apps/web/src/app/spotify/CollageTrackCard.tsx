import type { Track } from '@dg/content-models/spotify/Track';
import type { SxObject } from '@dg/ui/theme';
import type { CSSProperties } from 'react';
import { AlbumSleeve } from '../collage/AlbumSleeve';
import { PaperCard } from '../collage/PaperCard';
import {
  ALBUM_GRADIENT_GLOW_SX,
  ALBUM_GRADIENT_SURFACE_SX,
  AlbumGradientBackdrop,
} from './AlbumGradientBackdrop';
import { type Colors, getContrastingColors } from './colors';
import { TrackCardMeta } from './TrackCardMeta';

export const COLLAGE_TRACK_COLORS: Colors = {
  primary: 'var(--on)',
  primaryContrast: 'var(--pc)',
  primaryShadow: 'none',
  secondary: 'var(--soft)',
  secondaryShadow: 'none',
};

/** The classic card's gradient surface, cut to the paper's torn edge. */
const tornGradientSurfaceSx: SxObject = {
  ...ALBUM_GRADIENT_SURFACE_SX,
  clipPath: 'var(--clip, var(--quad-a))',
};

/** The paper under the gradient is the classic card's, so the colors blend the same. */
const CLASSIC_CARD_PAPER: CSSProperties & Record<`--${string}`, string> = {
  '--on': 'var(--mui-palette-text-primary)',
  '--pc': 'var(--mui-palette-background-paper)',
};

/** The collage now playing card: album sleeve over the classic gradient card, torn. */
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
          innerClassName="paperInnerUnclipped"
          style={CLASSIC_CARD_PAPER}
        >
          <AlbumGradientBackdrop containerSx={tornGradientSurfaceSx} gradient={gradient} />
          <div className="home__spotifyMetaInner">
            <TrackCardMeta colors={colors} service="Spotify" track={track} />
          </div>
        </PaperCard>
      </div>
    </div>
  );
}
