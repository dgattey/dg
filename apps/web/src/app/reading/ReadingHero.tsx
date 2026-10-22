import { CutOut } from '../collage/CutOut';
import { CUT_OUT_PLACEMENTS } from '../collage/cutOutPlacements';
import { PaperCard } from '../collage/PaperCard';
import { PaperTag } from '../collage/PaperTag';
import { BookCover, BookMeta } from './ReadingCards';
import type { FeaturedBook } from './readingHelpers';

function BookmarkRibbon() {
  return (
    <svg
      aria-hidden="true"
      className="reading__ribbon"
      focusable="false"
      preserveAspectRatio="none"
      viewBox="0 0 28 200"
    >
      <path d="M0,0 H28 V200 L14,188 L0,200 Z" fill="var(--vermilion)" />
      <path
        d="M7,0 V188 M21,0 V188"
        fill="none"
        stroke="var(--ochre)"
        strokeDasharray="4 4"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function ReadingHero({
  featured: { book, tag },
  stats,
}: {
  featured: FeaturedBook;
  stats: { fiveStars: number; total: number };
}) {
  return (
    <div className="reading__hero">
      {CUT_OUT_PLACEMENTS.readingHero.map((placement) => (
        <CutOut key={placement.id} placement={placement} />
      ))}
      <PaperCard
        className="reading__feature"
        edge="soft-a"
        innerClassName="reading__featureInner"
        tag={
          <>
            <PaperTag
              className="collagePin reading__heroTag"
              edge="quad-b"
              tiltDeg={-3}
              tone="ochre"
            >
              {tag}
            </PaperTag>
            <PaperTag
              className="collagePin reading__heroCount"
              edge="quad-d"
              tiltDeg={2.5}
              tone="cobalt"
            >
              {stats.total} books · {stats.fiveStars} five-star picks
            </PaperTag>
          </>
        }
        tiltDeg={-1}
        tone="viridian"
      >
        <div className="reading__heroPrint">
          <BookmarkRibbon />
          <BookCover book={book} preload={true} width={240} />
        </div>
        <div className="reading__featureBody">
          <h2 className="reading__featureTitle">{book.title}</h2>
          <p className="reading__author">{book.author}</p>
          <p className="reading__meta">
            <BookMeta book={book} withYear={true} />
          </p>
          {book.review ? (
            <PaperCard
              className="reading__slip reading__heroSlip"
              edge="torn-c"
              innerClassName="reading__slipInner"
              tiltDeg={0.8}
              tone="cream"
            >
              <p>{book.review}</p>
            </PaperCard>
          ) : null}
        </div>
      </PaperCard>
    </div>
  );
}
