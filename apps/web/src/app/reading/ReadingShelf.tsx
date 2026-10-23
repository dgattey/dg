'use client';

import type { RenderableBook } from '@dg/content-models/contentful/renderables/books';
import { startTransition, useState, ViewTransition } from 'react';
import { collageCardTreatment } from '../collage/collageCardTreatment';
import { PaperPills } from '../collage/PaperPills';
import { PaperTag } from '../collage/PaperTag';
import type { PaperTone } from '../collage/types';
import { CoverCard, ReviewCard } from './ReadingCards';
import { ReadingHero } from './ReadingHero';
import {
  bookCardKind,
  featuredBook,
  filterBooks,
  type ReadingFilterKey,
  readingFilterOptions,
  shelfSections,
  shelfStats,
  sortBooks,
} from './readingHelpers';

/** Shared view-transition class, so every moving piece of the shelf runs on one clock. */
const SHELF_TRANSITION = 'reading-shelf';

const YEAR_TAGS = [
  { tiltDeg: -3, tone: 'cream' },
  { tiltDeg: 2.5, tone: 'vermilion' },
  { tiltDeg: -2, tone: 'cobalt' },
  { tiltDeg: 3, tone: 'rose' },
] as const satisfies ReadonlyArray<{ tiltDeg: number; tone: PaperTone }>;

/** Paper comes from the unfiltered shelf position, so a card keeps its look as it moves. */
function ShelfCard({ book, shelfIndex }: { book: RenderableBook; shelfIndex: number }) {
  const treatment = collageCardTreatment(shelfIndex);
  const kind = bookCardKind(book);
  switch (kind) {
    case 'cover':
      return <CoverCard book={book} treatment={treatment} />;
    case 'feature':
    case 'review':
      return (
        <ReviewCard book={book} flip={shelfIndex % 2 === 1} kind={kind} treatment={treatment} />
      );
    default: {
      const unhandled: never = kind;
      return unhandled;
    }
  }
}

export function ReadingShelf({ books }: { books: ReadonlyArray<RenderableBook> }) {
  const [filterKey, setFilterKey] = useState<ReadingFilterKey>('all');

  const shelf = sortBooks(books);
  const featured = filterKey === 'all' ? featuredBook(shelf) : null;
  const sections = shelfSections(
    filterBooks(shelf, filterKey).filter((book) => book.id !== featured?.book.id),
  );
  const filterOptions = readingFilterOptions(shelf).map(({ count, key, label, tiltDeg }) => ({
    key,
    label: (
      <>
        {label} <small>{count}</small>
      </>
    ),
    tiltDeg,
  }));

  return (
    <>
      <PaperPills
        label="Filter books"
        onSelect={(key) => startTransition(() => setFilterKey(key))}
        options={filterOptions}
        selected={filterKey}
      />
      {featured ? (
        <ViewTransition default={SHELF_TRANSITION} key={featured.book.id}>
          <ReadingHero featured={featured} stats={shelfStats(shelf)} />
        </ViewTransition>
      ) : null}
      {sections.map((section, sectionIndex) => {
        const yearTag = YEAR_TAGS[sectionIndex % YEAR_TAGS.length] ?? YEAR_TAGS[0];
        return (
          <section aria-label={section.label} className="reading__section" key={section.label}>
            <ViewTransition default={SHELF_TRANSITION}>
              <h2 className="reading__sectionHeading">
                <PaperTag
                  className="reading__sectionTag"
                  edge="quad-c"
                  tiltDeg={yearTag.tiltDeg}
                  tone={yearTag.tone}
                >
                  {section.label}
                  <small>
                    {section.books.length} {section.books.length === 1 ? 'book' : 'books'}
                  </small>
                </PaperTag>
              </h2>
            </ViewTransition>
            <div className="reading__grid">
              {section.books.map((book) => (
                <ViewTransition default={SHELF_TRANSITION} key={book.id}>
                  <ShelfCard book={book} shelfIndex={shelf.indexOf(book)} />
                </ViewTransition>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
