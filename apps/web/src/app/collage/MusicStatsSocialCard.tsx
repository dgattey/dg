import { formatYearTick } from '@dg/shared-core/dates/periodStatus';
import { PAPER_PALETTE } from './paperPalette';
import {
  type CutOutPiece,
  PAPER_SHADOW,
  type PaperColor,
  PIECE_SHADOW,
  QUAD_A,
  QUAD_C,
  SocialCardFrame,
  SocialCardHeadline,
  SocialCardSplit,
  SocialCardStampRow,
  SocialCardTag,
} from './SocialCardParts';
import { SocialCardScallop } from './SocialCardScallop';

export type MusicStatsCardVariant = {
  activeDaysPercent: string;
  activeDaysSub: string;
  listeningHours: string;
  playsCompact: string;
  playsFull: string;
  topAlbums: ReadonlyArray<{
    artistNames: string;
    imageUrl: string | null;
    name: string;
    plays: string;
  }>;
  topArtists: ReadonlyArray<{
    name: string;
    plays: string;
  }>;
  tracksAndArtistsSub: string;
  variant: 'music-stats';
  year: number;
  years: ReadonlyArray<{
    plays: number;
    year: number;
  }>;
};

const STATS_CUT_OUTS: ReadonlyArray<CutOutPiece> = [
  { color: 'viridian', rotationDeg: -22, shape: 'monstera', size: 520, x: 690, y: -180 },
  { color: 'olive', rotationDeg: 18, shape: 'seaweed2', size: 220, x: -90, y: 340 },
  { color: 'vermilion', rotationDeg: -10, shape: 'coral', size: 180, x: 460, y: -48 },
  { color: 'rose', rotationDeg: 14, shape: 'trefoil', size: 130, x: 1050, y: 460 },
  { color: 'ochre', rotationDeg: -8, shape: 'star5', size: 48, x: 490, y: 248 },
];

const VINYL_GROOVES = [88, 76, 64, 52] as const;

export function AlbumCoverBox({
  fallbackTone,
  imageUrl,
  size,
}: {
  fallbackTone: PaperColor;
  imageUrl: string | null;
  size: number;
}) {
  if (imageUrl) {
    return (
      <img
        alt=""
        height={size}
        src={imageUrl}
        style={{ borderRadius: 6, height: size, objectFit: 'cover', width: size }}
        width={size}
      />
    );
  }
  const vinylSize = Math.round(size * 0.72);
  return (
    <div
      style={{
        alignItems: 'center',
        background: PAPER_PALETTE[fallbackTone],
        borderRadius: 6,
        display: 'flex',
        height: size,
        justifyContent: 'center',
        width: size,
      }}
    >
      <svg
        aria-hidden="true"
        height={vinylSize}
        style={{ filter: PIECE_SHADOW }}
        viewBox="0 0 200 200"
        width={vinylSize}
      >
        <circle cx="100" cy="100" fill={PAPER_PALETTE.black} r="96" />
        {VINYL_GROOVES.map((radius) => (
          <circle
            cx="100"
            cy="100"
            fill="none"
            key={radius}
            r={radius}
            stroke="rgba(247,241,226,0.16)"
            strokeWidth="1.5"
          />
        ))}
        <circle cx="100" cy="100" fill={PAPER_PALETTE.cream} r="32" />
        <circle cx="100" cy="100" fill={PAPER_PALETTE.black} r="6" />
      </svg>
    </div>
  );
}

function StatStub({
  label,
  sub,
  tiltDeg,
  tone,
  value,
}: {
  label: string;
  sub: string;
  tiltDeg: number;
  tone: PaperColor;
  value: string;
}) {
  return (
    <div
      style={{
        background: PAPER_PALETTE[tone],
        borderRadius: QUAD_A,
        boxShadow: PAPER_SHADOW,
        color: PAPER_PALETTE.ink,
        display: 'flex',
        flexDirection: 'column',
        padding: '14px 18px 16px',
        transform: `rotate(${tiltDeg}deg)`,
      }}
    >
      <span style={{ fontSize: 15, fontWeight: 700, opacity: 0.78 }}>{label}</span>
      <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ fontSize: 13, marginTop: 4, opacity: 0.8 }}>{sub}</span>
    </div>
  );
}

export function MusicStatsSocialCard({
  activeDaysPercent,
  activeDaysSub,
  grainUrl,
  listeningHours,
  playsCompact,
  playsFull,
  topAlbums,
  topArtists,
  tracksAndArtistsSub,
  year,
  years,
}: MusicStatsCardVariant & { grainUrl: string }) {
  const maxYearPlays = Math.max(...years.map((item) => item.plays), 1);
  const topAlbum = topAlbums[0];
  return (
    <SocialCardFrame borderTone="ultramarine" cutOuts={STATS_CUT_OUTS} grainUrl={grainUrl}>
      <SocialCardSplit>
        <div style={{ display: 'flex', flexDirection: 'column', width: 490 }}>
          <SocialCardStampRow>
            <SocialCardTag tiltDeg={2.5} tone="cobalt">
              <span>{year}</span>
            </SocialCardTag>
          </SocialCardStampRow>
          <SocialCardHeadline fontSize={94} headline="Listening stats" indentEm={0.44} />
          <div style={{ alignItems: 'center', display: 'flex', gap: 14, marginTop: 26 }}>
            <StatStub
              label={`Plays in ${year}`}
              sub={tracksAndArtistsSub}
              tiltDeg={-2.4}
              tone="ochre"
              value={playsCompact}
            />
            <StatStub
              label="Listening time"
              sub={`In ${year}`}
              tiltDeg={2.1}
              tone="cream"
              value={listeningHours}
            />
            <SocialCardScallop size={134} tiltDeg={-6} tone="vermilion">
              <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.9 }}>Active days</span>
              <span style={{ fontSize: 30, fontWeight: 700, lineHeight: 1 }}>
                {activeDaysPercent}
              </span>
              <span style={{ fontSize: 11, opacity: 0.88 }}>{activeDaysSub}</span>
            </SocialCardScallop>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 530 }}>
          <div style={{ alignItems: 'stretch', display: 'flex', gap: 14 }}>
            {topAlbum ? (
              <div
                style={{
                  alignItems: 'center',
                  background: PAPER_PALETTE.cream,
                  borderRadius: QUAD_A,
                  boxShadow: PAPER_SHADOW,
                  color: PAPER_PALETTE.ink,
                  display: 'flex',
                  flex: 1,
                  gap: 14,
                  padding: 14,
                  transform: 'rotate(-1.8deg)',
                }}
              >
                <AlbumCoverBox fallbackTone="ochre" imageUrl={topAlbum.imageUrl} size={104} />
                <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 3 }}>
                  <span style={{ color: PAPER_PALETTE.vermilion, fontSize: 13, fontWeight: 700 }}>
                    {`#1 ALBUM IN ${year}`}
                  </span>
                  <span style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.1 }}>
                    {topAlbum.name}
                  </span>
                  <span style={{ fontSize: 15, opacity: 0.76 }}>{topAlbum.artistNames}</span>
                  <span style={{ fontSize: 17, fontWeight: 700, marginTop: 2 }}>
                    {topAlbum.plays} plays
                  </span>
                </div>
              </div>
            ) : null}
            {topArtists.length > 0 ? (
              <div
                style={{
                  background: PAPER_PALETTE.rose,
                  borderRadius: QUAD_C,
                  boxShadow: PAPER_SHADOW,
                  color: PAPER_PALETTE.ink,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  padding: '14px 16px',
                  transform: 'rotate(2.2deg)',
                  width: 196,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, opacity: 0.78 }}>
                  {`TOP ARTISTS · ${year}`}
                </span>
                {topArtists.slice(0, 3).map((artist, idx) => (
                  <div
                    key={artist.name}
                    style={{
                      alignItems: 'baseline',
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: idx === 0 ? 6 : 4,
                    }}
                  >
                    <span style={{ fontSize: 16, fontWeight: 700 }}>
                      {idx + 1}. {artist.name}
                    </span>
                    <span style={{ fontSize: 13, opacity: 0.82 }}>{artist.plays}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          {years.length > 0 ? (
            <div
              style={{
                background: PAPER_PALETTE.viridian,
                borderRadius: QUAD_A,
                boxShadow: PAPER_SHADOW,
                color: PAPER_PALETTE.cream,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                padding: '18px 22px 16px',
                transform: 'rotate(1.2deg)',
              }}
            >
              <div
                style={{ alignItems: 'baseline', display: 'flex', justifyContent: 'space-between' }}
              >
                <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>
                  Plays per year
                </span>
                <span
                  style={{
                    background: PAPER_PALETTE.ochre,
                    borderRadius: 8,
                    color: PAPER_PALETTE.ink,
                    fontSize: 15,
                    fontWeight: 700,
                    padding: '3px 10px',
                  }}
                >
                  {year} · {playsFull} plays
                </span>
              </div>
              <div style={{ alignItems: 'flex-end', display: 'flex', gap: 7, height: 128 }}>
                {years.map((item) => {
                  const isHighlighted = item.year === year;
                  const barHeight = Math.max(12, Math.round((item.plays / maxYearPlays) * 98));
                  return (
                    <div
                      key={item.year}
                      style={{
                        alignItems: 'center',
                        display: 'flex',
                        flex: 1,
                        flexDirection: 'column',
                        gap: 5,
                      }}
                    >
                      <div
                        style={{
                          background: isHighlighted
                            ? PAPER_PALETTE.ochre
                            : PAPER_PALETTE.chartreuse,
                          borderRadius: '4px 4px 2px 2px',
                          height: barHeight,
                          opacity: isHighlighted ? 1 : 0.78,
                          width: '100%',
                        }}
                      />
                      <span style={{ fontSize: 12, opacity: isHighlighted ? 1 : 0.75 }}>
                        {formatYearTick(item.year)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </SocialCardSplit>
    </SocialCardFrame>
  );
}
