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
import { SocialCardScallop } from './SocialCardScallop';

export type ChangelogCardRelease = {
  dateLabel: string | null;
  kindLabel: string;
  kindTone: PaperColor;
  notes: ReadonlyArray<string>;
  tag: string;
};

export type ChangelogCardVariant = {
  latestRelease: ChangelogCardRelease | null;
  latestVersionTag: string;
  majorAndMinorCount: number;
  patchCount: number;
  recentReleases: ReadonlyArray<ChangelogCardRelease>;
  totalReleases: number;
  variant: 'changelog';
};

const CHANGELOG_CUT_OUTS: ReadonlyArray<CutOutPiece> = [
  { color: 'viridian', rotationDeg: -20, shape: 'monstera', size: 420, x: 760, y: -150 },
  { color: 'olive', rotationDeg: 18, shape: 'fern', size: 280, x: -95, y: 330 },
  { color: 'vermilion', rotationDeg: -12, shape: 'coral', size: 185, x: 465, y: -44 },
  { color: 'ochre', rotationDeg: 14, shape: 'star5', size: 48, x: 490, y: 248 },
  { color: 'chartreuse', rotationDeg: -18, shape: 'trefoil', size: 130, x: 1055, y: 465 },
];

const BETWEEN_ROW = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
} as const;

function CountTicket({
  count,
  label,
  sublabel,
  tiltDeg,
  tone,
}: {
  count: number;
  label: string;
  sublabel: string;
  tiltDeg: number;
  tone: PaperColor;
}) {
  return (
    <div
      style={{
        background: PAPER_PALETTE[tone],
        borderRadius: tone === 'cobalt' ? QUAD_A : QUAD_C,
        boxShadow: PAPER_SHADOW,
        color: inkForTone(tone),
        display: 'flex',
        flexDirection: 'column',
        padding: '14px 18px 16px',
        transform: `rotate(${tiltDeg}deg)`,
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 700, opacity: 0.84 }}>{label}</span>
      <span style={{ fontSize: 34, fontWeight: 700, lineHeight: 1 }}>{count}</span>
      <span style={{ fontSize: 13, marginTop: 4, opacity: 0.8 }}>{sublabel}</span>
    </div>
  );
}

export function ChangelogSocialCard({
  grainUrl,
  latestRelease,
  latestVersionTag,
  majorAndMinorCount,
  patchCount,
  recentReleases,
  totalReleases,
}: ChangelogCardVariant & { grainUrl: string }) {
  return (
    <SocialCardFrame borderTone="rose" cutOuts={CHANGELOG_CUT_OUTS} grainUrl={grainUrl}>
      <div
        style={{
          ...BETWEEN_ROW,
          height: '100%',
          position: 'relative',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', width: 470 }}>
          <div style={{ alignItems: 'center', display: 'flex', gap: 16, marginBottom: 18 }}>
            <SocialCardStamp rotationDeg={-4} width={114} />
            <SocialCardTag tiltDeg={2.4} tone="cobalt">
              <span>{latestVersionTag}</span>
            </SocialCardTag>
          </div>
          <SocialCardHeadline fontSize={100} headline="Changelog" singleLine />
          <SocialCardMattedCard
            matTiltDeg={1.8}
            matTone="ochre"
            padding="14px 22px 16px"
            style={{ marginTop: 22, width: 445 }}
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
              VERSION HISTORY & RELEASE NOTES
            </span>
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
              {`${totalReleases} shipped releases on GitHub`}
            </span>
          </SocialCardMattedCard>
          <div style={{ alignItems: 'center', display: 'flex', gap: 14, marginTop: 22 }}>
            <SocialCardScallop size={136} tiltDeg={-6} tone="vermilion">
              <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.9 }}>Total</span>
              <span style={{ fontSize: 32, fontWeight: 700, lineHeight: 1 }}>{totalReleases}</span>
              <span style={{ fontSize: 12, opacity: 0.88 }}>releases</span>
            </SocialCardScallop>
            <CountTicket
              count={majorAndMinorCount}
              label="Major & minor"
              sublabel="feature drops"
              tiltDeg={2.2}
              tone="cobalt"
            />
            <CountTicket
              count={patchCount}
              label="Patches"
              sublabel="fixes & polish"
              tiltDeg={-2.1}
              tone="cream"
            />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 535 }}>
          {latestRelease ? (
            <div
              style={{
                background: PAPER_PALETTE.cream,
                borderRadius: QUAD_A,
                boxShadow: PAPER_SHADOW,
                color: PAPER_PALETTE.ink,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                padding: '20px 22px',
                transform: 'rotate(-1.2deg)',
              }}
            >
              <div style={BETWEEN_ROW}>
                <div style={{ alignItems: 'center', display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 28, fontWeight: 700 }}>{latestRelease.tag}</span>
                  <span
                    style={{
                      background: PAPER_PALETTE[latestRelease.kindTone],
                      borderRadius: 8,
                      color: inkForTone(latestRelease.kindTone),
                      fontSize: 14,
                      fontWeight: 700,
                      padding: '4px 10px',
                    }}
                  >
                    {latestRelease.kindLabel}
                  </span>
                </div>
                {latestRelease.dateLabel ? (
                  <span style={{ fontSize: 15, fontWeight: 700, opacity: 0.68 }}>
                    {latestRelease.dateLabel}
                  </span>
                ) : null}
              </div>
              {latestRelease.notes.slice(0, 3).map((note) => (
                <div key={note} style={{ display: 'flex', fontSize: 16, gap: 8, lineHeight: 1.32 }}>
                  <span style={{ color: PAPER_PALETTE.vermilion, fontWeight: 700 }}>•</span>
                  <span>{note.length > 96 ? `${note.slice(0, 96)}…` : note}</span>
                </div>
              ))}
            </div>
          ) : null}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentReleases.slice(0, 3).map((release, index) => {
              const summary = release.notes[0] ?? `${release.kindLabel} release`;
              const isViridian = index % 2 === 0;
              return (
                <div
                  key={release.tag}
                  style={{
                    ...BETWEEN_ROW,
                    background: isViridian ? PAPER_PALETTE.viridian : PAPER_PALETTE.ochre,
                    borderRadius: QUAD_C,
                    boxShadow: PAPER_SHADOW,
                    color: isViridian ? PAPER_PALETTE.cream : PAPER_PALETTE.ink,
                    gap: 12,
                    padding: '12px 18px',
                    transform: `rotate(${isViridian ? 1.1 : -1.2}deg)`,
                  }}
                >
                  <div style={{ alignItems: 'center', display: 'flex', gap: 10 }}>
                    <span style={{ fontSize: 20, fontWeight: 700 }}>{release.tag}</span>
                    <span style={{ fontSize: 15, opacity: 0.9 }}>
                      {summary.length > 48 ? `${summary.slice(0, 48)}…` : summary}
                    </span>
                  </div>
                  {release.dateLabel ? (
                    <span style={{ fontSize: 14, fontWeight: 700, opacity: 0.82 }}>
                      {release.dateLabel}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SocialCardFrame>
  );
}
