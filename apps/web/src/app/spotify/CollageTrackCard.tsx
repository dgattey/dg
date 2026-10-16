import type { Track } from '@dg/content-models/spotify/Track';
import type { SxObject } from '@dg/ui/theme';
import type { CSSProperties } from 'react';
import { AlbumSleeve } from '../collage/AlbumSleeve';
import { PaperCard } from '../collage/PaperCard';
import { AlbumGradientBackdrop } from './AlbumGradientBackdrop';
import type { Colors } from './colors';
import { TrackCardMeta } from './TrackCardMeta';

export const COLLAGE_TRACK_COLORS: Colors = {
  primary: 'var(--on)',
  primaryContrast: 'var(--pc)',
  primaryShadow: 'none',
  secondary: 'var(--soft)',
  secondaryShadow: 'none',
};

/** The album's colors bloom out behind the sleeve and card, onto the sheet. */
const collageGlowSx: SxObject = {
  borderRadius: '45%',
  filter: 'blur(36px)',
  inset: '-28px -40px',
  opacity: 0.8,
  zIndex: -1,
};

/** Tints the card's paper, clipped to its torn edge, under the text. */
const collageTintSx: SxObject = {
  clipPath: 'var(--clip, var(--quad-a))',
  inset: 0,
  zIndex: -1,
};

/**
 * A dark album gradient lays over ink-dark paper with cream text, so the
 * colors deepen like the classic dark card's instead of washing out on cream.
 */
const COLLAGE_LIGHT_INK: CSSProperties & Record<`--${string}`, string> = {
  '--on': 'var(--cream)',
  '--pc': 'var(--ink-on-cream)',
  '--soft': 'color-mix(in oklab, var(--cream) 80%, transparent)',
};

/** The collage now playing card: album sleeve over a torn paper card tinted by the art. */
export function CollageTrackCard({ track }: { track: Track }) {
  const gradient = track.albumGradient;
  return (
    <div className="home__spotify" data-slot="sp">
      <AlbumGradientBackdrop containerSx={collageGlowSx} gradient={gradient} />
      <AlbumSleeve track={track} />
      <PaperCard
        className="home__spotifyMeta"
        edge="quad-b"
        innerClassName="paperInnerUnclipped"
        style={
          gradient && track.albumGradientContrastSetting === 'dark' ? COLLAGE_LIGHT_INK : undefined
        }
        tiltDeg={-2}
        tone="cream"
      >
        <AlbumGradientBackdrop containerSx={collageTintSx} gradient={gradient} />
        <div className="home__spotifyMetaInner">
          <TrackCardMeta colors={COLLAGE_TRACK_COLORS} textShadow={false} track={track} />
        </div>
      </PaperCard>
    </div>
  );
}
