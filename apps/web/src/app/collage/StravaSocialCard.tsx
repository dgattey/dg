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
  SocialCardStamp,
  SocialCardTag,
} from './SocialCardParts';
import { SocialCardScallop } from './SocialCardScallop';

export type StravaCardVariant = {
  feetClimbed: string;
  firstYear: number;
  latestTitle: string | null;
  miles: string;
  outings: string;
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
  latestTitle,
  miles,
  outings,
  routePaths,
}: StravaCardVariant & { grainUrl: string }) {
  return (
    <SocialCardFrame borderTone="cerulean" cutOuts={STRAVA_CUT_OUTS} grainUrl={grainUrl}>
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          height: '100%',
          justifyContent: 'space-between',
          position: 'relative',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', width: 485 }}>
          <div style={{ alignItems: 'center', display: 'flex', gap: 16, marginBottom: 16 }}>
            <SocialCardStamp rotationDeg={-4} width={114} />
            <SocialCardTag tiltDeg={2.4} tone="cobalt">
              <span>Bay Area miles</span>
            </SocialCardTag>
          </div>
          <SocialCardHeadline fontSize={118} headline="Big map" indentEm={0.48} />
          <SocialCardMattedCard
            matTiltDeg={1.8}
            matTone="ochre"
            padding="14px 22px 16px"
            style={{ marginTop: 18, maxWidth: 460 }}
            tiltDeg={-1.4}
          >
            <span
              style={{
                color: PAPER_PALETTE.vermilion,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.02em',
              }}
            >
              EVERY RIDE, RUN & HIKE ON STRAVA
            </span>
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
              {latestTitle ? `Latest: ${latestTitle}` : 'Mapped across the San Francisco Bay Area'}
            </span>
          </SocialCardMattedCard>
          <div style={{ alignItems: 'center', display: 'flex', gap: 12, marginTop: 22 }}>
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
              <span style={{ fontSize: 12, opacity: 0.88 }}>outings</span>
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
                background: '#f2ead7',
                borderRadius: 10,
                display: 'flex',
                height: STRAVA_CARD_MAP_FRAME.height,
                overflow: 'hidden',
                position: 'relative',
                width: STRAVA_CARD_MAP_FRAME.width,
              }}
            >
              <svg
                aria-hidden="true"
                height={STRAVA_CARD_MAP_FRAME.height}
                viewBox={`0 0 ${STRAVA_CARD_MAP_FRAME.width} ${STRAVA_CARD_MAP_FRAME.height}`}
                width={STRAVA_CARD_MAP_FRAME.width}
              >
                <path
                  d="M0 84 H484 M0 168 H484 M0 252 H484 M0 336 H484 M96 0 V420 M192 0 V420 M288 0 V420 M384 0 V420"
                  fill="none"
                  stroke="rgba(79,142,193,0.22)"
                  strokeWidth="1"
                />
                {routePaths.map(({ d, tone }) => (
                  <path
                    d={d}
                    fill="none"
                    key={tone}
                    stroke={PAPER_PALETTE[tone]}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity={tone === 'cobalt' ? 0.82 : 0.9}
                    strokeWidth={tone === 'cobalt' ? 2.1 : 2.5}
                  />
                ))}
              </svg>
            </div>
            <SocialCardTag
              style={{ bottom: -10, position: 'absolute', right: 16 }}
              tiltDeg={-3}
              tone="cobalt"
            >
              <span>{outings} routes · Bay Area</span>
            </SocialCardTag>
          </div>
        </div>
      </div>
    </SocialCardFrame>
  );
}
