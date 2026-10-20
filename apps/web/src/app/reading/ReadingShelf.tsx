'use client';

import type { RenderableBook } from '@dg/content-models/contentful/renderables/books';
import { jsOnlyProps } from '@dg/ui/core/JsOnlyStyle';
import { Image } from '@dg/ui/dependent/Image';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import { CutLetters } from '../collage/CutLetters';
import { PaperCard } from '../collage/PaperCard';
import { PaperTag } from '../collage/PaperTag';
import { cx } from '../collage/paperVars';
import {
  buildYearGroups,
  filterAndSortBooks,
  formatFinishedMonthYear,
  formatRailStarSummary,
  READING_FILTER_OPTIONS,
  type ReadingFilterKey,
  splitReviewIntoPullAndRest,
  streamCardTreatment,
  yearBadgeStyle,
} from './readingHelpers';

type CoverTiltStyle = CSSProperties & {
  '--cover-r': string;
};

function StarRating({ rating, size = 15 }: { rating: number | null; size?: number }) {
  if (rating === null || rating < 1) {
    return null;
  }
  const clamped = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span aria-label={`${clamped} out of 5 stars`} className="reading__stars" role="img">
      {[1, 2, 3, 4, 5].map((index) => {
        const filled = index <= clamped;
        return (
          <svg
            aria-hidden="true"
            className={cx('reading__star', filled ? 'reading__starOn' : 'reading__starEmpty')}
            height={size}
            key={index}
            viewBox="0 0 100 100"
            width={size}
          >
            <use href="#co-star5" />
          </svg>
        );
      })}
    </span>
  );
}

function BookCover({
  book,
  extraLargeSize,
  preload = false,
}: {
  book: RenderableBook;
  extraLargeSize: number;
  preload?: boolean;
}) {
  if (!book.thumbnail) {
    return (
      <div aria-hidden="true" className="reading__coverFallback">
        {book.title}
      </div>
    );
  }
  return (
    <Image
      alt={`Book cover of ${book.title} by ${book.author}`}
      fetchPriority={preload ? 'high' : undefined}
      height={book.thumbnail.height}
      loading={preload ? 'eager' : undefined}
      preload={preload}
      sizes={{ extraLarge: extraLargeSize, small: extraLargeSize }}
      url={book.thumbnail.url}
      width={book.thumbnail.width}
    />
  );
}

function LatestFeatureCard({ book }: { book: RenderableBook }) {
  const finishedLabel = formatFinishedMonthYear(book.readDateFinished);
  const { pullQuote, restText } = splitReviewIntoPullAndRest(book.review);

  return (
    <PaperCard
      className="reading__feature reading__cardOnDark"
      edge="soft-a"
      innerClassName="reading__featureInner"
      tiltDeg={-0.5}
      tone="viridian"
    >
      <div className="reading__featureCover">
        <BookCover book={book} extraLargeSize={200} preload={true} />
      </div>
      <section aria-label={`Latest read: ${book.title}`} className="reading__featureBody">
        <div className="reading__featureKicker">
          <svg aria-hidden="true" fill="currentColor" height={16} viewBox="0 0 100 100" width={16}>
            <use href="#co-star5" />
          </svg>
          <span>Latest read</span>
        </div>
        <h2 className="reading__featureTitle">{book.title}</h2>
        <p className="reading__featureAuthor">{book.author}</p>
        <div className="reading__featureMeta">
          <StarRating rating={book.rating} size={16} />
          {finishedLabel ? <span className="reading__date">Finished {finishedLabel}</span> : null}
        </div>
        {pullQuote ? <p className="reading__featurePull">“{pullQuote}”</p> : null}
        {restText ? <p className="reading__featureRest">{restText}</p> : null}
      </section>
    </PaperCard>
  );
}

function StreamBookCard({
  book,
  index,
  isWide,
}: {
  book: RenderableBook;
  index: number;
  isWide: boolean;
}) {
  const treatment = streamCardTreatment(book, index);
  const finishedLabel = formatFinishedMonthYear(book.readDateFinished);
  const hasNote = Boolean(book.review?.trim());
  const coverStyle: CoverTiltStyle = {
    '--cover-r': `${treatment.coverTiltDeg}deg`,
  };

  return (
    <PaperCard
      className={cx(
        'reading__card',
        treatment.onDarkSurface ? 'reading__cardOnDark' : 'reading__cardOnLight',
        treatment.isKraft && 'reading__cardKraft',
        isWide && 'reading__cardWide',
        isWide && !hasNote && 'reading__cardWideNoNote',
      )}
      edge={treatment.edge}
      innerClassName="reading__cardInner"
      tiltDeg={treatment.tiltDeg}
      tone={treatment.tone}
    >
      <div className="reading__cardTop">
        <div className="reading__coverWrap" style={coverStyle}>
          <BookCover book={book} extraLargeSize={isWide ? 112 : 96} />
        </div>
        <div className="reading__cardHead">
          <h3 className="reading__bookTitle">{book.title}</h3>
          <p className="reading__bookAuthor">{book.author}</p>
          <div className="reading__metaRow">
            <StarRating rating={book.rating} size={15} />
            {finishedLabel ? <span className="reading__date">{finishedLabel}</span> : null}
          </div>
        </div>
      </div>
      {hasNote ? <p className="reading__note">{book.review}</p> : null}
    </PaperCard>
  );
}

export function ReadingShelf({
  books,
  title = 'Reading',
}: {
  books: ReadonlyArray<RenderableBook>;
  title?: string;
}) {
  const [filterKey, setFilterKey] = useState<ReadingFilterKey>('newest');

  const orderedAllBooks = filterAndSortBooks(books, 'newest');
  const visibleBooks = filterAndSortBooks(books, filterKey);
  const latestBook = visibleBooks[0] ?? orderedAllBooks[0] ?? null;
  const yearGroups = buildYearGroups(
    orderedAllBooks,
    visibleBooks,
    latestBook ? latestBook.id : null,
  );

  let runningCardIndex = 0;

  return (
    <>
      <div className="reading__titleRow">
        <CutLetters className="collagePageTitle reading__title" text={title} />
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

      {latestBook ? <LatestFeatureCard book={latestBook} /> : null}

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
                  <PaperTag
                    className="reading__yearTag"
                    edge={badge.edge}
                    tiltDeg={badge.tiltDeg}
                    tone={badge.tone}
                  >
                    {group.year}
                  </PaperTag>
                  <div className="reading__railStats">
                    <span className="reading__railCount">
                      {group.totalCount} {group.totalCount === 1 ? 'book' : 'books'}
                    </span>
                    {avgSummary ? <span>{avgSummary}</span> : null}
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
                    const isWide =
                      group.streamBooks.length % 2 === 1 &&
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
