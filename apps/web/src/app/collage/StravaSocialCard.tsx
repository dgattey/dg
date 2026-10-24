import { PAPER_PALETTE } from './paperPalette';
import {
  type CutOutPiece,
  FILL,
  PAPER_SHADOW,
  type PaperColor,
  QUAD_A,
  QUAD_C,
  SocialCardFrame,
  SocialCardHeadline,
  SocialCardMattedCard,
  SocialCardSplit,
  SocialCardStampRow,
  SocialCardTag,
} from './SocialCardParts';
import { SocialCardScallop } from './SocialCardScallop';

export type StravaMapTile = {
  left: number;
  size: number;
  top: number;
  url: string;
};

export type StravaCardVariant = {
  feetClimbed: string;
  firstYear: number;
  landPaths: ReadonlyArray<string>;
  latestKicker: string | null;
  latestTitle: string | null;
  mapTiles?: ReadonlyArray<StravaMapTile>;
  miles: string;
  outings: string;
  recentStat: string | null;
  routeCountLabel: string;
  routePaths: ReadonlyArray<{
    d: string;
    tone: PaperColor;
  }>;
  variant: 'strava';
};

const STRAVA_CUT_OUTS: ReadonlyArray<CutOutPiece> = [
  { color: 'viridian', rotationDeg: 18, shape: 'monstera', size: 360, x: 890, y: -120 },
  { color: 'leaf', rotationDeg: -20, shape: 'fern', size: 260, x: -95, y: 315 },
  { color: 'vermilion', rotationDeg: 14, shape: 'star4', size: 48, x: 485, y: 24 },
  { color: 'ochre', rotationDeg: -10, shape: 'trefoil', size: 130, x: 475, y: 468 },
];

export const STRAVA_CARD_MAP_FRAME = { height: 420, padding: 20, width: 484 };

export function StravaSocialCard({
  feetClimbed,
  firstYear,
  grainUrl,
  landPaths,
  latestKicker,
  latestTitle,
  mapTiles = [],
  miles,
  outings,
  recentStat,
  routeCountLabel,
  routePaths,
}: StravaCardVariant & { grainUrl: string }) {
  return (
    <SocialCardFrame borderTone="cerulean" cutOuts={STRAVA_CUT_OUTS} grainUrl={grainUrl}>
      <SocialCardSplit>
        <div style={{ display: 'flex', flexDirection: 'column', width: 485 }}>
          <SocialCardStampRow>
            {recentStat ? (
              <SocialCardTag tiltDeg={2.4} tone="cobalt">
                <span>{recentStat}</span>
              </SocialCardTag>
            ) : null}
          </SocialCardStampRow>
          <SocialCardHeadline fontSize={106} headline="Big map" singleLine />
          {latestTitle ? (
            <SocialCardMattedCard
              matTiltDeg={1.8}
              matTone="ochre"
              padding="14px 22px 16px"
              style={{ marginTop: 22, width: 450 }}
              tiltDeg={-1.4}
            >
              {latestKicker ? (
                <span
                  style={{
                    color: PAPER_PALETTE.vermilion,
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                  }}
                >
                  {latestKicker}
                </span>
              ) : null}
              <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>
                {latestTitle}
              </span>
            </SocialCardMattedCard>
          ) : null}
          <div style={{ alignItems: 'center', display: 'flex', gap: 12, marginTop: 24 }}>
            <SocialCardScallop size={136} tiltDeg={-7} tone="ochre">
              <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.8 }}>Total miles</span>
              <span
                style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}
              >
                {miles}
              </span>
              <span style={{ fontSize: 12, opacity: 0.78 }}>since {firstYear}</span>
            </SocialCardScallop>
            <SocialCardScallop size={132} tiltDeg={6} tone="viridian">
              <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.88 }}>Climbed</span>
              <span
                style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}
              >
                {feetClimbed}
              </span>
              <span style={{ fontSize: 12, opacity: 0.85 }}>feet</span>
            </SocialCardScallop>
            <SocialCardScallop size={132} tiltDeg={-5} tone="vermilion">
              <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.9 }}>Tracked</span>
              <span
                style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}
              >
                {outings}
              </span>
              <span style={{ fontSize: 12, opacity: 0.88 }}>activities</span>
            </SocialCardScallop>
          </div>
        </div>
        <div style={{ display: 'flex', height: 472, position: 'relative', width: 520 }}>
          <div
            style={{
              ...FILL,
              background: PAPER_PALETTE.cerulean,
              borderRadius: QUAD_C,
              boxShadow: PAPER_SHADOW,
              display: 'flex',
              transform: 'translate(10px, 10px) rotate(2.4deg)',
            }}
          />
          <div
            style={{
              background: PAPER_PALETTE.cream,
              borderRadius: QUAD_A,
              boxShadow: PAPER_SHADOW,
              display: 'flex',
              height: '100%',
              padding: 14,
              position: 'relative',
              transform: 'rotate(-1.2deg)',
              width: '100%',
            }}
          >
            <div
              style={{
                background: '#d6e5f0',
                borderRadius: 10,
                display: 'flex',
                height: STRAVA_CARD_MAP_FRAME.height,
                overflow: 'hidden',
                position: 'relative',
                width: STRAVA_CARD_MAP_FRAME.width,
              }}
            >
              {mapTiles.length > 0
                ? mapTiles.map((tile) => (
                    <img
                      alt=""
                      height={tile.size}
                      key={`${tile.left}-${tile.top}`}
                      src={tile.url}
                      style={{
                        height: tile.size,
                        left: tile.left,
                        position: 'absolute',
                        top: tile.top,
                        width: tile.size,
                      }}
                      width={tile.size}
                    />
                  ))
                : null}
              <svg
                aria-hidden="true"
                height={STRAVA_CARD_MAP_FRAME.height}
                style={{ left: 0, position: 'absolute', top: 0 }}
                viewBox={`0 0 ${STRAVA_CARD_MAP_FRAME.width} ${STRAVA_CARD_MAP_FRAME.height}`}
                width={STRAVA_CARD_MAP_FRAME.width}
              >
                {mapTiles.length === 0
                  ? landPaths.map((d) => (
                      <path
                        d={d}
                        fill="#f2ead7"
                        key={d.slice(0, 24)}
                        stroke="rgba(79,142,193,0.45)"
                        strokeWidth="1.5"
                      />
                    ))
                  : null}
                {routePaths.map(({ d, tone }) => (
                  <path
                    d={d}
                    fill="none"
                    key={`casing-${tone}`}
                    stroke={PAPER_PALETTE.cream}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity={0.62}
                    strokeWidth={3.1}
                  />
                ))}
                {routePaths.map(({ d, tone }) => (
                  <path
                    d={d}
                    fill="none"
                    key={tone}
                    stroke={PAPER_PALETTE[tone]}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity={0.86}
                    strokeWidth={1.65}
                  />
                ))}
              </svg>
            </div>
            <SocialCardTag
              style={{ bottom: -10, position: 'absolute', right: 16 }}
              tiltDeg={-3}
              tone="cobalt"
            >
              <span>{routeCountLabel}</span>
            </SocialCardTag>
          </div>
        </div>
      </SocialCardSplit>
    </SocialCardFrame>
  );
}
