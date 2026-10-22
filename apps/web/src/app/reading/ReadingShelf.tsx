'use client';

import type { RenderableBook } from '@dg/content-models/contentful/renderables/books';
import { startTransition, useState, ViewTransition } from 'react';
import { collageCardTreatment } from '../collage/collageCardTreatment';
import { PaperPills } from '../collage/PaperPills';
import { PaperTag } from '../collage/PaperTag';
import { BookCard, FeaturedBookCard } from './ReadingCards';
import {
  featuredBook,
  filterBooks,
  type ReadingFilterKey,
  readingFilterOptions,
  shelfSections,
  sortBooks,
} from './readingHelpers';

/** Shared view-transition class, so every moving piece of the shelf runs on one clock. */
const SHELF_TRANSITION = 'reading-shelf';

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
        className="reading__filters"
        label="Filter books"
        onSelect={(key) => startTransition(() => setFilterKey(key))}
        options={filterOptions}
        selected={filterKey}
      />
      {featured ? (
        <ViewTransition default={SHELF_TRANSITION} key={featured.book.id}>
          <FeaturedBookCard featured={featured} />
        </ViewTransition>
      ) : null}
      {sections.map((section, sectionIndex) => (
        <section aria-label={section.label} className="reading__section" key={section.label}>
          <ViewTransition default={SHELF_TRANSITION}>
            <h2 className="reading__sectionHeading">
              <PaperTag
                className="reading__sectionTag"
                edge="soft-b"
                tiltDeg={sectionIndex % 2 === 0 ? -1.2 : 0.8}
                tone={sectionIndex % 2 === 0 ? 'cream' : 'ochre'}
              >
                {section.label}
              </PaperTag>
            </h2>
          </ViewTransition>
          <div className="reading__grid">
            {/* Paper comes from the unfiltered shelf position, so a card keeps its tone as it moves. */}
            {section.books.map((book) => (
              <ViewTransition default={SHELF_TRANSITION} key={book.id}>
                <BookCard book={book} treatment={collageCardTreatment(shelf.indexOf(book))} />
              </ViewTransition>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
