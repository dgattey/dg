import { PAPER_PALETTE } from './paperPalette';
import {
  type CutOutPiece,
  inkForTone,
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

type SiteMapCardPage = {
  label: string;
  markdownPath: string;
  path: string;
  tone: PaperColor;
};

export type SiteMapCardVariant = {
  agentSurfaceCount: number;
  agentSurfaces: ReadonlyArray<{ badge: string; href: string; label: string }>;
  pageCount: number;
  pages: ReadonlyArray<SiteMapCardPage>;
  sideProjects: ReadonlyArray<string>;
  variant: 'site-map';
};

const SITE_MAP_CUT_OUTS: ReadonlyArray<CutOutPiece> = [
  { color: 'viridian', rotationDeg: -18, shape: 'monstera', size: 400, x: 780, y: -140 },
  {
    color: 'vermilion',
    rotationDeg: -14,
    shape: 'swallow',
    size: 170,
    underprint: 'cream',
    x: 455,
    y: 12,
  },
  { color: 'olive', rotationDeg: 19, shape: 'fern', size: 270, x: -95, y: 335 },
  { color: 'ochre', rotationDeg: 16, shape: 'pods', size: 185, x: 470, y: 445 },
  { color: 'rose', rotationDeg: -16, shape: 'coral', size: 170, x: 1030, y: 455 },
];

export function SiteMapSocialCard({
  agentSurfaceCount,
  agentSurfaces,
  grainUrl,
  pageCount,
  pages,
  sideProjects,
}: SiteMapCardVariant & { grainUrl: string }) {
  return (
    <SocialCardFrame borderTone="viridian" cutOuts={SITE_MAP_CUT_OUTS} grainUrl={grainUrl}>
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
        <div style={{ display: 'flex', flexDirection: 'column', width: 455 }}>
          <div style={{ alignItems: 'center', display: 'flex', gap: 14, marginBottom: 18 }}>
            <SocialCardStamp rotationDeg={-4} width={114} />
            <SocialCardTag tiltDeg={2.2} tone="cobalt">
              <span>{`${pageCount} pages · ${agentSurfaceCount} agent endpoints`}</span>
            </SocialCardTag>
          </div>
          <SocialCardHeadline fontSize={104} headline="Site map" singleLine />
          {sideProjects.length > 0 ? (
            <SocialCardMattedCard
              matTiltDeg={2}
              matTone="ochre"
              padding="14px 22px 16px"
              style={{ marginTop: 22, width: 435 }}
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
                SIDE PROJECTS & APPS
              </span>
              <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
                {sideProjects.join(' · ')}
              </span>
            </SocialCardMattedCard>
          ) : null}
          <div
            style={{
              background: PAPER_PALETTE.ultramarine,
              borderRadius: QUAD_A,
              boxShadow: PAPER_SHADOW,
              color: PAPER_PALETTE.cream,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              marginTop: 22,
              padding: '14px 18px 16px',
              transform: 'rotate(1.2deg)',
              width: 435,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.02em', opacity: 0.86 }}>
              MACHINE-READABLE AGENT SURFACES
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {agentSurfaces.slice(0, 5).map((s) => (
                <div
                  key={s.href}
                  style={{
                    alignItems: 'center',
                    background: PAPER_PALETTE.cream,
                    borderRadius: 8,
                    color: PAPER_PALETTE.ink,
                    display: 'flex',
                    fontSize: 14,
                    fontWeight: 700,
                    gap: 6,
                    padding: '4px 10px',
                  }}
                >
                  <span>{s.href}</span>
                  <span style={{ color: PAPER_PALETTE.cobalt, fontSize: 12 }}>{s.badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            justifyContent: 'space-between',
            width: 550,
          }}
        >
          {pages.map((page, index) => (
            <div
              key={page.path}
              style={{
                background: PAPER_PALETTE[page.tone],
                borderRadius: index % 2 === 0 ? QUAD_A : QUAD_C,
                boxShadow: PAPER_SHADOW,
                color: inkForTone(page.tone),
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                padding: '14px 16px',
                transform: `rotate(${index % 2 === 0 ? -1.4 : 1.5}deg)`,
                width: 266,
              }}
            >
              <div
                style={{ alignItems: 'baseline', display: 'flex', justifyContent: 'space-between' }}
              >
                <span style={{ fontSize: 20, fontWeight: 700 }}>{page.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, opacity: 0.82 }}>{page.path}</span>
              </div>
              <span
                style={{
                  alignSelf: 'flex-start',
                  background: 'rgba(29,26,21,0.12)',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '2px 8px',
                }}
              >
                {page.markdownPath}
              </span>
            </div>
          ))}
        </div>
      </div>
    </SocialCardFrame>
  );
}
