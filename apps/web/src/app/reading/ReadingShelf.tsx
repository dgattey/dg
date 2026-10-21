'use client';

import type { RenderableBook } from '@dg/content-models/contentful/renderables/books';
import { jsOnlyProps } from '@dg/ui/core/JsOnlyStyle';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import { CutLetters } from '../collage/CutLetters';
import { cutOutSymbolId } from '../collage/cutOutShapes';
import { PaperTag } from '../collage/PaperTag';
import { cx } from '../collage/paperVars';
import { NightstandHeroCollage } from './NightstandHeroCollage';
import { ScallopedStampBadge, StreamBookCard } from './ReadingCollageCards';
import { yearBadgeStyle } from './readingCardStyles';
import {
  buildYearGroups,
  filterAndSortBooks,
  formatRailStarSummary,
  READING_FILTER_OPTIONS,
  type ReadingFilterKey,
} from './readingHelpers';

export function ReadingShelf({
  books,
  title = 'Reading',
}: {
  books: ReadonlyArray<RenderableBook>;
  title?: string;
}) {
  const [filterKey, setFilterKey] = useState<ReadingFilterKey>('all');

  const orderedAllBooks = filterAndSortBooks(books, 'all');
  const visibleBooks = filterAndSortBooks(books, filterKey);
  const latestBook = visibleBooks[0] ?? orderedAllBooks[0] ?? null;
  const yearGroups = buildYearGroups(
    orderedAllBooks,
    visibleBooks,
    latestBook ? latestBook.id : null,
  );

  const fiveStarTotal = orderedAllBooks.filter((book) => book.rating === 5).length;

  let runningCardIndex = 0;

  return (
    <>
      <div className="reading__titleRow">
        <div className="reading__titleCluster">
          <CutLetters className="collagePageTitle reading__title" text={title} />
          <ScallopedStampBadge className="reading__headerSubStamp" tiltDeg={9} variant="butter">
            <span>Ex libris · notes & ratings</span>
          </ScallopedStampBadge>
        </div>

        <nav aria-label="Filter and sort books" className="reading__controls" {...jsOnlyProps}>
          {READING_FILTER_OPTIONS.map((option) => {
            const current = option.key === filterKey;
            return (
              <PaperTag
                className="reading__pillTag"
                edge="quad-a"
                key={option.key}
                tiltDeg={option.tiltDeg}
                tone={current ? 'black' : 'cream'}
              >
                <button
                  aria-pressed={current}
                  className="reading__pillButton"
                  onClick={() => setFilterKey(option.key)}
                  type="button"
                >
                  {option.label}
                </button>
              </PaperTag>
            );
          })}
        </nav>
      </div>

      {latestBook ? (
        <NightstandHeroCollage
          book={latestBook}
          fiveStarTotal={fiveStarTotal}
          totalBookCount={orderedAllBooks.length}
        />
      ) : null}

      {yearGroups.length > 0 ? (
        <div className="reading__sections">
          {yearGroups.map((group, groupIndex) => {
            const badge = yearBadgeStyle(group.year, groupIndex);
            const avgSummary = formatRailStarSummary(group.averageRating);
            return (
              <section
                aria-label={`Books finished in ${group.year}`}
                className="reading__yearSection"
                key={group.year}
              >
                <aside className="reading__yearRail">
                  <div className="reading__yearStampCluster">
                    <svg
                      aria-hidden="true"
                      className="reading__railCutout reading__railCutout--primary"
                      focusable="false"
                      style={
                        {
                          '--rail-cut-color': `var(--${badge.botanicalColor})`,
                          '--rail-cut-r': `${badge.botanicalRotationDeg}deg`,
                        } as CSSProperties
                      }
                      viewBox="0 0 400 400"
                    >
                      <use href={`#${cutOutSymbolId(badge.botanicalShape)}`} />
                    </svg>
                    <svg
                      aria-hidden="true"
                      className="reading__railCutout reading__railCutout--secondary"
                      focusable="false"
                      style={
                        {
                          '--rail-cut-color': `var(--${badge.secondaryColor})`,
                          '--rail-cut-r': `${badge.secondaryRotationDeg}deg`,
                        } as CSSProperties
                      }
                      viewBox="0 0 400 400"
                    >
                      <use href={`#${cutOutSymbolId(badge.secondaryShape)}`} />
                    </svg>

                    <div
                      className={cx(
                        'reading__dieCutYearStamp',
                        `reading__dieCutYearStamp--${badge.tone}`,
                      )}
                      style={{ '--year-r': `${badge.tiltDeg}deg` } as CSSProperties}
                    >
                      <span className="reading__dieCutYearNotch reading__dieCutYearNotch--left" />
                      <span className="reading__dieCutYearNotch reading__dieCutYearNotch--right" />
                      <span className="reading__dieCutYearLabel">{group.year}</span>
                    </div>

                    <PaperTag
                      className="reading__yearCountPill"
                      edge={badge.edge}
                      tiltDeg={badge.tiltDeg > 0 ? -3.5 : 3.8}
                      tone="cream"
                    >
                      <span className="reading__railCount">
                        {group.totalCount} {group.totalCount === 1 ? 'book' : 'books'}
                      </span>
                    </PaperTag>
                  </div>

                  <div className="reading__railStats">
                    {avgSummary ? <span className="reading__railAvg">{avgSummary}</span> : null}
                    {group.fiveStarCount > 0 ? (
                      <span className="reading__railSub">
                        {group.fiveStarCount} five-star{' '}
                        {group.fiveStarCount === 1 ? 'read' : 'reads'}
                      </span>
                    ) : null}
                    {group.includesLatest ? (
                      <span className="reading__railSub">Latest read is up top</span>
                    ) : null}
                  </div>
                </aside>

                <div className="reading__stream">
                  {group.streamBooks.map((book, idxInYear) => {
                    const cardIndex = runningCardIndex;
                    runningCardIndex += 1;
                    const nonDogEarCount = group.streamBooks.filter((b) => b.rating !== 5).length;
                    const isWide =
                      book.rating !== 5 &&
                      nonDogEarCount % 2 === 1 &&
                      idxInYear === group.streamBooks.length - 1;
                    return (
                      <StreamBookCard book={book} index={cardIndex} isWide={isWide} key={book.id} />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      ) : null}
    </>
  );
}
