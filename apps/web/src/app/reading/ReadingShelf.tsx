'use client';

import type { RenderableBook } from '@dg/content-models/contentful/renderables/books';
import { jsOnlyProps } from '@dg/ui/core/JsOnlyStyle';
import { type CSSProperties, useState } from 'react';
import { PaperCard } from '../collage/PaperCard';
import { cx } from '../collage/paperVars';
import {
  CutOutGlyph,
  NightstandHeroCollage,
  ScallopedStampBadge,
  StreamBookCard,
} from './ReadingCards';
import {
  buildYearGroups,
  filterAndSortBooks,
  formatRailStarSummary,
  READING_FILTER_OPTIONS,
  type ReadingFilterKey,
  yearBadgeStyle,
} from './readingHelpers';

type ReadingInlineStyle = CSSProperties & Record<`--${string}`, string | number>;

type ReadingShelfProps = {
  books: ReadonlyArray<RenderableBook>;
  title?: string;
};

export function ReadingShelf({ books, title = 'Reading' }: ReadingShelfProps) {
  const [activeFilter, setActiveFilter] = useState<ReadingFilterKey>('all');

  const allBooksInOrder = filterAndSortBooks(books, 'all');
  const visibleBooks = filterAndSortBooks(books, activeFilter);
  const fiveStarTotal = allBooksInOrder.filter((book) => book.rating === 5).length;

  const latestBook = visibleBooks[0] ?? null;
  const yearGroups = buildYearGroups(allBooksInOrder, visibleBooks, latestBook?.id ?? null);

  return (
    <div className="reading">
      <header className="reading__header">
        <div className="reading__titleCluster">
          <ScallopedStampBadge
            className="reading__exLibrisStamp"
            tiltDeg={-6.5}
            variant="terracotta"
          >
            <CutOutGlyph className="reading__stampIcon" shape="star4" />
            <span>Ex libris · notes & ratings</span>
          </ScallopedStampBadge>
          <h1
            className="paperTag paper--ochre edge--quad-a reading__title"
            style={{ '--r': '-1.8deg' } as ReadingInlineStyle}
          >
            <span>{title}</span>
          </h1>
          <p
            className="paperTag paper--viridian edge--quad-b reading__subtitle"
            style={{ '--r': '1.4deg' } as ReadingInlineStyle}
          >
            <span>Books off the nightstand, with dog-eared notes and star ratings.</span>
          </p>
        </div>

        <fieldset {...jsOnlyProps} aria-label="Filter books" className="reading__controls">
          <legend className="reading__srOnly">Filter books</legend>
          {READING_FILTER_OPTIONS.map((option) => {
            const isActive = activeFilter === option.key;
            return (
              <button
                aria-pressed={isActive}
                className={cx(
                  'paperTag',
                  isActive ? 'paper--vermilion' : 'paper--cream',
                  'edge--quad-a',
                  'reading__pill',
                  isActive && 'reading__pillActive',
                )}
                key={option.key}
                onClick={() => setActiveFilter(option.key)}
                style={{ '--r': `${option.tiltDeg}deg` } as ReadingInlineStyle}
                type="button"
              >
                <span>{option.label}</span>
              </button>
            );
          })}
        </fieldset>
      </header>

      {latestBook ? (
        <NightstandHeroCollage
          book={latestBook}
          fiveStarTotal={fiveStarTotal}
          totalBookCount={allBooksInOrder.length}
        />
      ) : null}

      {yearGroups.map((group, groupIndex) => {
        const badge = yearBadgeStyle(group.year, groupIndex);
        const starSummary = formatRailStarSummary(group.averageRating);
        const isLastGroup = groupIndex === yearGroups.length - 1;
        const countLabel = `${group.totalCount} ${group.totalCount === 1 ? 'book' : 'books'}`;

        return (
          <section
            aria-label={`Books finished in ${group.year}`}
            className={cx('reading__yearSection', isLastGroup && 'reading__yearSectionLast')}
            key={group.year}
          >
            <div className="reading__rail">
              <div className="reading__railBadgeCluster">
                <CutOutGlyph
                  className="reading__railBotanical"
                  shape={badge.botanicalShape}
                  style={
                    {
                      '--botanical-color': `var(--${badge.botanicalColor})`,
                      '--botanical-r': `${badge.botanicalRotationDeg}deg`,
                    } as ReadingInlineStyle
                  }
                />
                <CutOutGlyph
                  className="reading__railStarAccent"
                  shape={badge.secondaryShape}
                  style={
                    {
                      '--accent-color': `var(--${badge.secondaryColor})`,
                      '--accent-r': `${badge.secondaryRotationDeg}deg`,
                    } as ReadingInlineStyle
                  }
                />
                <h2
                  className={cx(
                    'reading__yearTag',
                    'reading__dieCutYearStamp',
                    `paper--${badge.tone}`,
                  )}
                  id={`reading-year-${group.year}`}
                  style={{ '--r': `${badge.tiltDeg}deg` } as ReadingInlineStyle}
                >
                  <span className="reading__yearStampSub">Shelf year</span>
                  <span className="reading__yearStampMain">{group.year}</span>
                </h2>
              </div>

              <PaperCard
                className="reading__railMetaSlip"
                edge={badge.edge}
                innerClassName="reading__railMetaSlipInner"
                tiltDeg={groupIndex % 2 === 0 ? 2.4 : -2.2}
                tone="cream"
              >
                <p className="reading__railCount">{countLabel}</p>
                {starSummary ? <p className="reading__railStars">{starSummary}</p> : null}
                {group.fiveStarCount > 0 ? (
                  <p className="reading__railFiveStarNote">
                    ★ {group.fiveStarCount} five-star{' '}
                    {group.fiveStarCount === 1 ? 'favorite' : 'favorites'}
                  </p>
                ) : null}
                {group.includesLatest ? (
                  <p className="reading__railSub">Latest read is up top</p>
                ) : null}
              </PaperCard>
            </div>

            <div className="reading__stream">
              {group.streamBooks.map((book, index) => {
                const isDogEar = book.rating === 5;
                const isLastAlone =
                  !isDogEar &&
                  index === group.streamBooks.length - 1 &&
                  group.streamBooks.filter((b) => b.rating !== 5).length % 2 === 1;
                return (
                  <StreamBookCard
                    book={book}
                    index={index + groupIndex * 2}
                    isWide={isLastAlone}
                    key={book.id}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
