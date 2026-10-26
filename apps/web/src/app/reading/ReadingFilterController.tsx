'use client';

import { inPageViewTransitionProps } from '@dg/ui/core/transitions/pageTransitions';
import { type ReactNode, startTransition, useState, ViewTransition } from 'react';
import { FilterBar } from '../collage/FilterBar';
import { PaperPills } from '../collage/PaperPills';
import { PaperTag } from '../collage/PaperTag';
import type { PaperTone } from '../collage/types';
import type { ReadingFilterKey, ReadingFilterOption } from './readingHelpers';

/** Shared view-transition class, so every moving piece of the shelf runs on one clock. */
const SHELF_TRANSITION = inPageViewTransitionProps('reading-shelf');
const MAX_ANIMATED_SHELF_BOOKS = 8;
const MAX_ANIMATED_SHELF_SECTIONS = 2;

const YEAR_TAGS = [
  { tiltDeg: -3, tone: 'cream' },
  { tiltDeg: 2.5, tone: 'vermilion' },
  { tiltDeg: -2, tone: 'cobalt' },
  { tiltDeg: 3, tone: 'rose' },
] as const satisfies ReadonlyArray<{ tiltDeg: number; tone: PaperTone }>;

export type ReadingShelfCardItem = {
  card: ReactNode;
  featuredInHero?: true;
  id: string;
  matches: ReadonlyArray<Exclude<ReadingFilterKey, 'all'>>;
};

export type ReadingShelfSectionItem = {
  books: ReadonlyArray<ReadingShelfCardItem>;
  label: string;
};

/**
 * Publishes the sticky filter bar's height on the shelf, so the sticky year
 * placards can stop just under it wherever the two share a column.
 */
function shareFiltersHeight(filters: HTMLDivElement | null) {
  const shelf = filters?.parentElement;
  if (!filters || !shelf) {
    return;
  }
  const observer = new ResizeObserver(([entry]) => {
    const height = entry?.borderBoxSize[0]?.blockSize ?? filters.offsetHeight;
    shelf.style.setProperty('--reading-filters-height', `${Math.ceil(height)}px`);
  });
  observer.observe(filters);
  return () => {
    observer.disconnect();
    shelf.style.removeProperty('--reading-filters-height');
  };
}

export function ReadingFilterController({
  filterOptions,
  hero,
  sections,
}: {
  filterOptions: ReadonlyArray<ReadingFilterOption>;
  hero: { id: string; node: ReactNode } | null;
  sections: ReadonlyArray<ReadingShelfSectionItem>;
}) {
  const [filterKey, setFilterKey] = useState<ReadingFilterKey>('all');

  const pillOptions = filterOptions.map(({ count, key, label, tiltDeg }) => ({
    key,
    label: (
      <>
        {label} <small>{count}</small>
      </>
    ),
    tiltDeg,
  }));

  const visibleSections = sections
    .map((section) => ({
      books: section.books.filter((book) =>
        filterKey === 'all' ? !book.featuredInHero : book.matches.includes(filterKey),
      ),
      label: section.label,
    }))
    .filter((section) => section.books.length > 0);

  return (
    <>
      <FilterBar ref={shareFiltersHeight}>
        <PaperPills
          label="Filter books"
          onSelect={(key) => startTransition(() => setFilterKey(key))}
          options={pillOptions}
          selected={filterKey}
        />
      </FilterBar>
      {filterKey === 'all' && hero ? (
        <ViewTransition default={SHELF_TRANSITION} key={hero.id}>
          {hero.node}
        </ViewTransition>
      ) : null}
      {visibleSections.map((section, sectionIndex) => {
        const yearTag = YEAR_TAGS[sectionIndex % YEAR_TAGS.length] ?? YEAR_TAGS[0];
        return (
          <section aria-label={section.label} className="reading__section" key={section.label}>
            <ViewTransition
              default={sectionIndex < MAX_ANIMATED_SHELF_SECTIONS ? SHELF_TRANSITION : 'none'}
            >
              <h2 className="reading__sectionHeading">
                <PaperTag
                  className="reading__sectionTag"
                  edge="quad-c"
                  tiltDeg={yearTag.tiltDeg}
                  tone={yearTag.tone}
                  variant="stat-md"
                >
                  {section.label}
                  <small>
                    {section.books.length} {section.books.length === 1 ? 'book' : 'books'}
                  </small>
                </PaperTag>
              </h2>
            </ViewTransition>
            <div className="reading__grid">
              {section.books.map((book, bookIndex) => (
                <ViewTransition
                  default={
                    sectionIndex === 0 && bookIndex < MAX_ANIMATED_SHELF_BOOKS
                      ? SHELF_TRANSITION
                      : 'none'
                  }
                  key={book.id}
                >
                  {book.card}
                </ViewTransition>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
