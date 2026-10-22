import type { CSSProperties } from 'react';
import { PORTRAIT_OVAL_PATH } from './cutOutShapes';
import {
  type FavoriteAlbumsCardVariant,
  FavoriteAlbumsSocialCard,
  type MusicHistoryCardVariant,
  MusicHistorySocialCard,
} from './MusicSocialCards';
import { type MusicStatsCardVariant, MusicStatsSocialCard } from './MusicStatsSocialCard';
import { PAPER_PALETTE } from './paperPalette';
import { type ReadingCardVariant, ReadingSocialCard } from './ReadingSocialCard';
import {
  type CutOutPiece,
  LIFTED_SHADOW,
  PIECE_SHADOW,
  SocialCardFrame,
  SocialCardHeadline,
  SocialCardMattedCard,
  SocialCardStamp,
} from './SocialCardParts';
import { type StravaCardVariant, StravaSocialCard } from './StravaSocialCard';

export type HomeCardVariant = {
  headline: string;
  name: string;
  portraitUrl: string | null;
  tagline: string;
  variant?: 'home';
};

export type SocialCardVariant =
  | HomeCardVariant
  | MusicStatsCardVariant
  | MusicHistoryCardVariant
  | FavoriteAlbumsCardVariant
  | ReadingCardVariant
  | StravaCardVariant;

export type SocialCardProps = {
  grainUrl: string;
} & SocialCardVariant;

const MONSTERA: CutOutPiece = {
  color: 'viridian',
  rotationDeg: -34,
  shape: 'monstera',
  size: 700,
  x: 640,
  y: -230,
};

const HOME_CUT_OUTS: ReadonlyArray<CutOutPiece> = [
  { color: 'ultramarine', rotationDeg: -12, shape: 'seaweed', size: 240, x: -118, y: 96 },
  { color: 'olive', rotationDeg: 22, shape: 'fern', size: 320, x: -96, y: 312 },
  { color: 'ultramarine', rotationDeg: 168, shape: 'coral', size: 170, x: 548, y: -52 },
  { color: 'rose', rotationDeg: -8, shape: 'seaweed2', size: 190, x: 600, y: 440 },
  {
    color: 'vermilion',
    rotationDeg: -14,
    shape: 'birdpara',
    size: 250,
    underprint: 'ultramarine',
    x: 950,
    y: 392,
  },
  { color: 'chartreuse', rotationDeg: 24, shape: 'trefoil', size: 120, x: 1074, y: 236 },
  { color: 'ochre', rotationDeg: 10, shape: 'star4', size: 46, x: 700, y: 300 },
];

export const PORTRAIT = { height: 420, mat: 14, width: 320 };

/** Satori's `clip-path: path()` takes pixels, so the unit oval is scaled to each box. */
function ovalPath(width: number, height: number) {
  let axis = 0;
  return PORTRAIT_OVAL_PATH.replace(/[\d.]+/g, (unit) => {
    const length = axis++ % 2 === 0 ? width : height;
    return String(Math.round(Number(unit) * length * 100) / 100);
  });
}

function AboutTag({ style }: { style: CSSProperties }) {
  return (
    <div
      style={{
        alignItems: 'baseline',
        background: PAPER_PALETTE.ochre,
        borderRadius: '13px 15px 12px 16px',
        color: PAPER_PALETTE.ink,
        display: 'flex',
        filter: PIECE_SHADOW,
        gap: 10,
        padding: '10px 18px 12px',
        position: 'absolute',
        transform: 'rotate(-5deg)',
        ...style,
      }}
    >
      <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.01em' }}>About</span>
      <span style={{ fontSize: 22, opacity: 0.78 }}>Dylan</span>
    </div>
  );
}

function PortraitPrint({ portraitUrl }: { portraitUrl: string }) {
  const haloWidth = PORTRAIT.width + 2 * PORTRAIT.mat;
  const haloHeight = PORTRAIT.height + 2 * PORTRAIT.mat;
  return (
    <div
      style={{
        display: 'flex',
        height: haloHeight,
        position: 'absolute',
        right: 64,
        top: 40,
        transform: 'rotate(-3deg)',
        width: haloWidth,
      }}
    >
      <svg
        aria-hidden="true"
        height={haloHeight}
        style={{ filter: LIFTED_SHADOW, left: 0, position: 'absolute', top: 0 }}
        viewBox={`0 0 ${haloWidth} ${haloHeight}`}
        width={haloWidth}
      >
        <path d={ovalPath(haloWidth, haloHeight)} fill={PAPER_PALETTE.cream} />
      </svg>
      <img
        alt=""
        height={PORTRAIT.height}
        src={portraitUrl}
        style={{
          clipPath: `path('${ovalPath(PORTRAIT.width, PORTRAIT.height)}')`,
          left: PORTRAIT.mat,
          objectFit: 'cover',
          position: 'absolute',
          top: PORTRAIT.mat,
        }}
        width={PORTRAIT.width}
      />
      <AboutTag style={{ bottom: 44, left: -36 }} />
    </div>
  );
}

function StampFeature() {
  return (
    <div style={{ display: 'flex', position: 'absolute', right: 110, top: 150 }}>
      <SocialCardStamp rotationDeg={4} width={300} />
      <AboutTag style={{ bottom: -46, left: -30 }} />
    </div>
  );
}

function HomeSocialCard({
  grainUrl,
  headline,
  name,
  portraitUrl,
  tagline,
}: HomeCardVariant & { grainUrl: string }) {
  const cutOuts = [
    { ...MONSTERA, color: portraitUrl ? MONSTERA.color : ('olive' as const) },
    ...HOME_CUT_OUTS,
  ];
  return (
    <SocialCardFrame borderTone="viridian" cutOuts={cutOuts} grainUrl={grainUrl}>
      {portraitUrl ? <PortraitPrint portraitUrl={portraitUrl} /> : <StampFeature />}
      {portraitUrl ? (
        <div style={{ display: 'flex', marginBottom: 26 }}>
          <SocialCardStamp rotationDeg={-4} width={124} />
        </div>
      ) : null}
      <SocialCardHeadline fontSize={144} headline={headline} indentEm={0.62} />
      <SocialCardMattedCard
        matOffset={13}
        matTiltDeg={2}
        matTone="ochre"
        padding="18px 30px 20px 26px"
        style={{ marginTop: 26 }}
        tiltDeg={-1.5}
      >
        {name === headline ? null : (
          <span style={{ fontSize: 42, fontWeight: 700, letterSpacing: '-0.02em' }}>{name}</span>
        )}
        <span style={{ fontSize: 32 }}>{tagline}</span>
      </SocialCardMattedCard>
    </SocialCardFrame>
  );
}

export function SocialCard(props: SocialCardProps) {
  switch (props.variant) {
    case undefined:
    case 'home':
      return <HomeSocialCard {...props} />;
    case 'music-stats':
      return <MusicStatsSocialCard {...props} />;
    case 'music-history':
      return <MusicHistorySocialCard {...props} />;
    case 'favorite-albums':
      return <FavoriteAlbumsSocialCard {...props} />;
    case 'reading':
      return <ReadingSocialCard {...props} />;
    case 'strava':
      return <StravaSocialCard {...props} />;
    default: {
      const unhandled: never = props;
      return unhandled;
    }
  }
}
