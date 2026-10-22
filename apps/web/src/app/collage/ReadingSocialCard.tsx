import { CUT_OUT_SHAPES } from './cutOutShapes';
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

export type ReadingCardBook = {
  author: string;
  coverUrl: string | null;
  rating: number | null;
  review: string | null;
  title: string;
  year: string;
};

export type ReadingCardVariant = {
  featured: (ReadingCardBook & { tag: 'Currently reading' | 'Latest review' }) | null;
  fiveStarCount: number;
  picks: ReadonlyArray<ReadingCardBook>;
  totalBooks: number;
  variant: 'reading';
};

const READING_CUT_OUTS: ReadonlyArray<CutOutPiece> = [
  { color: 'viridian', rotationDeg: -18, shape: 'monstera', size: 420, x: 760, y: -150 },
  {
    color: 'vermilion',
    rotationDeg: -14,
    shape: 'swallow',
    size: 170,
    underprint: 'cream',
    x: 455,
    y: 12,
  },
  { color: 'olive', rotationDeg: 20, shape: 'fern', size: 280, x: -95, y: 330 },
  { color: 'ochre', rotationDeg: 18, shape: 'pods', size: 190, x: 470, y: 440 },
  { color: 'chartreuse', rotationDeg: -20, shape: 'trefoil', size: 125, x: 1060, y: 470 },
];

const PICK_TONES: ReadonlyArray<PaperColor> = ['rose', 'ochre'];
const STAR_SLOTS = [1, 2, 3, 4, 5] as const;

function StarRow({
  color,
  rating,
  size = 16,
}: {
  color: PaperColor;
  rating: number | null;
  size?: number;
}) {
  const count = rating && rating >= 1 && rating <= 5 ? rating : 5;
  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: 3 }}>
      {STAR_SLOTS.slice(0, count).map((slot) => (
        <svg
          aria-hidden="true"
          height={size}
          key={`star-${slot}`}
          viewBox="0 0 400 400"
          width={size}
        >
          <path d={CUT_OUT_SHAPES.star5} fill={PAPER_PALETTE[color]} />
        </svg>
      ))}
    </div>
  );
}

function BookCoverThumb({
  coverUrl,
  height,
  title,
  tone = 'ochre',
  width,
}: {
  coverUrl: string | null;
  height: number;
  title: string;
  tone?: PaperColor;
  width: number;
}) {
  if (coverUrl) {
    return (
      <img
        alt=""
        height={height}
        src={coverUrl}
        style={{
          borderRadius: 6,
          boxShadow: PAPER_SHADOW,
          height,
          objectFit: 'cover',
          width,
        }}
        width={width}
      />
    );
  }
  return (
    <div
      style={{
        alignItems: 'center',
        background: PAPER_PALETTE[tone],
        borderRadius: 6,
        boxShadow: PAPER_SHADOW,
        color: inkForTone(tone),
        display: 'flex',
        fontSize: 14,
        fontWeight: 700,
        height,
        justifyContent: 'center',
        padding: 10,
        textAlign: 'center',
        width,
      }}
    >
      <span>{title.slice(0, 26)}</span>
    </div>
  );
}

export function ReadingSocialCard({
  featured,
  fiveStarCount,
  grainUrl,
  picks,
  totalBooks,
}: ReadingCardVariant & { grainUrl: string }) {
  const slipBook = picks.find((book) => book.review) ?? featured;
  return (
    <SocialCardFrame borderTone="viridian" cutOuts={READING_CUT_OUTS} grainUrl={grainUrl}>
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
        <div style={{ display: 'flex', flexDirection: 'column', width: 465 }}>
          <div style={{ alignItems: 'center', display: 'flex', gap: 14, marginBottom: 18 }}>
            <SocialCardStamp rotationDeg={-4} width={114} />
            <SocialCardTag tiltDeg={2.2} tone="cobalt">
              <span>
                {totalBooks} books · {fiveStarCount} favorites
              </span>
            </SocialCardTag>
          </div>
          <SocialCardHeadline fontSize={94} headline="Books I've read" indentEm={0.32} />
          {slipBook ? (
            <SocialCardMattedCard
              matTiltDeg={2}
              matTone="ochre"
              padding="16px 22px 18px"
              style={{ marginTop: 24, width: 445 }}
              tiltDeg={-1.4}
            >
              <div style={{ alignItems: 'center', display: 'flex', gap: 10 }}>
                <StarRow color="vermilion" rating={slipBook.rating} size={18} />
                <span style={{ fontSize: 15, fontWeight: 700, opacity: 0.75 }}>
                  {`${slipBook.title} · ${slipBook.author}`}
                </span>
              </div>
              {slipBook.review ? (
                <span style={{ fontSize: 18, lineHeight: 1.32, marginTop: 4 }}>
                  {`“${slipBook.review.slice(0, 128)}${slipBook.review.length > 128 ? '…' : ''}”`}
                </span>
              ) : null}
            </SocialCardMattedCard>
          ) : null}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 535 }}>
          {featured ? (
            <div
              style={{
                background: PAPER_PALETTE.viridian,
                borderRadius: QUAD_A,
                boxShadow: PAPER_SHADOW,
                color: PAPER_PALETTE.cream,
                display: 'flex',
                gap: 18,
                padding: '22px 22px 20px',
                position: 'relative',
                transform: 'rotate(-1.2deg)',
              }}
            >
              <div
                style={{
                  background: PAPER_PALETTE.cream,
                  borderRadius: QUAD_C,
                  boxShadow: PAPER_SHADOW,
                  color: PAPER_PALETTE.ink,
                  display: 'flex',
                  fontSize: 15,
                  fontWeight: 700,
                  left: 18,
                  padding: '5px 14px',
                  position: 'absolute',
                  top: -14,
                  transform: 'rotate(-3deg)',
                }}
              >
                {featured.tag}
              </div>
              <div style={{ display: 'flex', position: 'relative' }}>
                <BookCoverThumb
                  coverUrl={featured.coverUrl}
                  height={186}
                  title={featured.title}
                  tone="ochre"
                  width={126}
                />
                <svg
                  aria-hidden="true"
                  height={76}
                  style={{ left: 12, position: 'absolute', top: -8 }}
                  viewBox="0 0 28 110"
                  width={22}
                >
                  <path d="M0,0 H28 V110 L14,98 L0,110 Z" fill={PAPER_PALETTE.vermilion} />
                  <path
                    d="M7,0 V98 M21,0 V98"
                    fill="none"
                    stroke={PAPER_PALETTE.ochre}
                    strokeDasharray="4 4"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div
                style={{
                  display: 'flex',
                  flex: 1,
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <StarRow color="ochre" rating={featured.rating} size={18} />
                <span style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.15, marginTop: 4 }}>
                  {featured.title}
                </span>
                <span style={{ fontSize: 16, marginTop: 4, opacity: 0.86 }}>{featured.author}</span>
                {featured.review ? (
                  <div
                    style={{
                      background: PAPER_PALETTE.cream,
                      borderRadius: QUAD_C,
                      color: PAPER_PALETTE.ink,
                      display: 'flex',
                      fontSize: 14,
                      lineHeight: 1.3,
                      marginTop: 10,
                      padding: '10px 12px',
                      transform: 'rotate(0.8deg)',
                    }}
                  >
                    <span>
                      {featured.review.slice(0, 108)}
                      {featured.review.length > 108 ? '…' : ''}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
          <div style={{ display: 'flex', gap: 16 }}>
            {picks.slice(0, 2).map((book, idx) => {
              const tone = PICK_TONES[idx % PICK_TONES.length] ?? 'rose';
              return (
                <div
                  key={`${book.title}-${book.author}`}
                  style={{
                    alignItems: 'center',
                    background: PAPER_PALETTE[tone],
                    borderRadius: QUAD_C,
                    boxShadow: PAPER_SHADOW,
                    color: inkForTone(tone),
                    display: 'flex',
                    flex: 1,
                    gap: 12,
                    padding: 12,
                    transform: `rotate(${idx === 0 ? 1.8 : -2.1}deg)`,
                  }}
                >
                  <BookCoverThumb
                    coverUrl={book.coverUrl}
                    height={102}
                    title={book.title}
                    tone="cream"
                    width={70}
                  />
                  <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 2 }}>
                    <StarRow color="vermilion" rating={book.rating} size={15} />
                    <span style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.15 }}>
                      {book.title}
                    </span>
                    <span style={{ fontSize: 14, opacity: 0.82 }}>{book.author}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, marginTop: 2, opacity: 0.72 }}>
                      Read {book.year}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SocialCardFrame>
  );
}
