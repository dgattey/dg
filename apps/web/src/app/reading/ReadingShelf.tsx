'use client';

import type { RenderableBook } from '@dg/content-models/contentful/renderables/books';
import { jsOnlyProps } from '@dg/ui/core/JsOnlyStyle';
import { Image } from '@dg/ui/dependent/Image';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import { CutLetters } from '../collage/CutLetters';
import { cutOutSymbolId } from '../collage/cutOutShapes';
import { PaperCard } from '../collage/PaperCard';
import { PaperTag } from '../collage/PaperTag';
import { cx } from '../collage/paperVars';
import {
  buildYearGroups,
  filterAndSortBooks,
  formatFinishedMonthYear,
  formatRailStarSummary,
  inferBookGenre,
  READING_FILTER_OPTIONS,
  type ReadingFilterKey,
  splitReviewIntoPullAndRest,
  streamCardTreatment,
  yearBadgeStyle,
} from './readingHelpers';

type CardInlineStyle = CSSProperties & {
  '--card-offset'?: string;
  '--cover-r'?: string;
  '--stamp-r'?: string;
};

/**
 * Generates an organic scalloped postage-stamp SVG polygon path.
 */
function ScallopedStampBadge({
  children,
  className,
  tiltDeg = 0,
  variant = 'terracotta',
}: {
  children: React.ReactNode;
  className?: string;
  tiltDeg?: number;
  variant?: 'butter' | 'cobalt' | 'ochre' | 'plum' | 'rose' | 'terracotta' | 'viridian';
}) {
  const style: CardInlineStyle = {
    '--stamp-r': `${tiltDeg}deg`,
  };
  return (
    <span
      className={cx('reading__scallopStamp', `reading__scallopStamp--${variant}`, className)}
      style={style}
    >
      <span className="reading__scallopStampInner">{children}</span>
    </span>
  );
}

function StarRating({ rating, size = 15 }: { rating: number | null; size?: number }) {
  if (rating === null || rating < 1) {
    return null;
  }
  const clamped = Math.max(0, Math.min(5, Math.round(rating)));
  const starHref = `#${cutOutSymbolId('star5')}`;
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
            viewBox="0 0 400 400"
            width={size}
          >
            <use href={starHref} />
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

function NightstandHeroCollage({
  book,
  totalBookCount,
  fiveStarTotal,
}: {
  book: RenderableBook;
  fiveStarTotal: number;
  totalBookCount: number;
}) {
  const finishedLabel = formatFinishedMonthYear(book.readDateFinished);
  const { pullQuote, restText } = splitReviewIntoPullAndRest(book.review);
  const genre = inferBookGenre(book, 0);
  const isActivelyReading = book.readingStatus === 'reading';
  const progressText = isActivelyReading ? '68% read' : '68% read · finished';

  return (
    <div className="reading__heroStage">
      {/* Organic curved/cutout asymmetric paper backing mats (--terracotta + --butter) */}
      <svg
        aria-hidden="true"
        className="reading__heroMatBack reading__heroMatBack--terracotta"
        focusable="false"
        preserveAspectRatio="none"
        viewBox="0 0 1000 420"
      >
        <path d="M38,44 C180,8 410,26 640,12 C820,2 958,28 984,96 C1006,158 988,288 962,364 C934,412 760,416 510,404 C250,392 54,414 20,352 C-8,296 8,144 38,44 Z" />
      </svg>
      <svg
        aria-hidden="true"
        className="reading__heroMatBack reading__heroMatBack--butter"
        focusable="false"
        preserveAspectRatio="none"
        viewBox="0 0 1000 420"
      >
        <path d="M18,28 C210,-6 490,18 760,6 C910,-2 982,38 992,124 C1002,216 978,342 938,388 C884,422 620,402 360,412 C130,420 22,386 10,312 C-2,232 4,88 18,28 Z" />
      </svg>

      {/* Expressive botanical & star cutouts framing the hero collage (±8deg to ±25deg) */}
      <svg
        aria-hidden="true"
        className="reading__heroCutout reading__heroCutout--monstera"
        focusable="false"
        viewBox="0 0 400 400"
      >
        <use href={`#${cutOutSymbolId('monstera')}`} />
      </svg>
      <svg
        aria-hidden="true"
        className="reading__heroCutout reading__heroCutout--fern"
        focusable="false"
        viewBox="0 0 400 400"
      >
        <use href={`#${cutOutSymbolId('fern')}`} />
      </svg>
      <svg
        aria-hidden="true"
        className="reading__heroCutout reading__heroCutout--starTop"
        focusable="false"
        viewBox="0 0 400 400"
      >
        <use href={`#${cutOutSymbolId('star5')}`} />
      </svg>
      <svg
        aria-hidden="true"
        className="reading__heroCutout reading__heroCutout--starBottom"
        focusable="false"
        viewBox="0 0 400 400"
      >
        <use href={`#${cutOutSymbolId('star4')}`} />
      </svg>

      {/* Tilted scalloped stamp ("On the nightstand" at -11deg) */}
      <ScallopedStampBadge className="reading__nightstandStamp" tiltDeg={-11} variant="terracotta">
        <svg aria-hidden="true" className="reading__stampIcon" viewBox="0 0 400 400">
          <use href={`#${cutOutSymbolId('star5')}`} />
        </svg>
        <span>On the nightstand</span>
      </ScallopedStampBadge>

      {/* Tactile paper-cut progress & shelf badge pinned on the right */}
      <div className="reading__heroBadgesRight">
        <PaperTag className="reading__progressBadge" edge="quad-b" tiltDeg={8.5} tone="ochre">
          <span className="reading__progressDot" />
          <span>{progressText}</span>
        </PaperTag>
        <PaperTag className="reading__shelfTotalBadge" edge="quad-d" tiltDeg={-5.5} tone="cobalt">
          <span>
            {totalBookCount} books · {fiveStarTotal} five-star picks
          </span>
        </PaperTag>
      </div>

      <PaperCard
        className="reading__feature reading__cardOnDark"
        edge="soft-a"
        innerClassName="reading__featureInner"
        tiltDeg={-1.2}
        tone="viridian"
      >
        <div className="reading__featureCoverStage">
          {/* Physical notched bookmark ribbon sticking out of the top & bottom of the book */}
          <svg
            aria-hidden="true"
            className="reading__bookmarkRibbonTop"
            focusable="false"
            viewBox="0 0 64 110"
          >
            <path
              d="M14,110 L14,18 C14,8 22,2 32,2 C42,2 50,8 50,18 L50,110 Z"
              fill="var(--vermilion)"
            />
            <path
              d="M24,106 L24,20 C24,14 28,10 32,10 C36,10 40,14 40,20 L40,106"
              fill="none"
              stroke="var(--ochre)"
              strokeDasharray="4 4"
              strokeWidth="2.5"
            />
          </svg>

          <div className="reading__featurePolaroid">
            <span aria-hidden="true" className="reading__maskingTape reading__maskingTape--hero" />
            <div className="reading__featureCover">
              <BookCover book={book} extraLargeSize={210} preload={true} />
            </div>
            <div className="reading__polaroidCaption">
              <span>{genre}</span>
              <span>p. 164 / 240</span>
            </div>
          </div>

          <svg
            aria-hidden="true"
            className="reading__bookmarkRibbonTail"
            focusable="false"
            viewBox="0 0 56 84"
          >
            <path d="M8,0 L48,0 L52,78 L28,58 L4,78 Z" fill="var(--vermilion)" />
            <path d="M16,0 L40,0 L42,60 L28,48 L14,60 Z" fill="var(--ochre)" opacity="0.45" />
          </svg>
        </div>

        <section aria-label={`Latest read: ${book.title}`} className="reading__featureBody">
          <div className="reading__featureKickerRow">
            <span className="reading__featureKicker">
              <svg
                aria-hidden="true"
                fill="currentColor"
                height={16}
                viewBox="0 0 400 400"
                width={16}
              >
                <use href={`#${cutOutSymbolId('star5')}`} />
              </svg>
              <span>Latest read</span>
            </span>
            <span className="reading__genreSticker reading__genreSticker--hero">{genre}</span>
          </div>

          <h2 className="reading__featureTitle">{book.title}</h2>
          <p className="reading__featureAuthor">{book.author}</p>

          <div className="reading__featureMeta">
            <StarRating rating={book.rating} size={17} />
            {finishedLabel ? (
              <span className="reading__date">Finished {finishedLabel}</span>
            ) : (
              <span className="reading__date">Reading now</span>
            )}
          </div>

          {/* Tactile paper-cut reading progress bar */}
          <div aria-hidden="true" className="reading__progressStrip">
            <div className="reading__progressTrack">
              <div className="reading__progressFill" />
            </div>
            <span className="reading__progressCaption">Nightstand notes & dog-eared pages</span>
          </div>

          {pullQuote ? (
            <div className="reading__featureQuoteSlip">
              <p className="reading__featurePull">“{pullQuote}”</p>
              {restText ? <p className="reading__featureRest">{restText}</p> : null}
            </div>
          ) : null}
        </section>
      </PaperCard>
    </div>
  );
}

/**
 * Standout 5-star callout card ("dog-eared pick"):
 * Spans 2 columns in the collage stream, pairing a tilted polaroid book cover with a
 * colored library-checkout note slip (--butter, --ochre, or --terracotta), masking tape
 * strip at the top, stamped rating stars, and a genre sticker pill.
 */
function DogEaredFeatureCard({ book, index }: { book: RenderableBook; index: number }) {
  const treatment = streamCardTreatment(book, index);
  const finishedLabel = formatFinishedMonthYear(book.readDateFinished);
  const { pullQuote, restText } = splitReviewIntoPullAndRest(book.review);
  const cardStyle: CardInlineStyle = {
    '--cover-r': `${treatment.coverTiltDeg}deg`,
  };
  const slipNote =
    pullQuote ??
    'Five-star shelf favorite — dog-eared and kept on the top stack to hand to friends.';

  return (
    <article
      className={cx(
        'reading__dogEarCard',
        `reading__dogEarCard--${treatment.dogEarVariant}`,
        index % 2 === 1 && 'reading__dogEarCard--reverse',
      )}
      style={{ '--r': `${treatment.tiltDeg}deg` } as CSSProperties}
    >
      {/* Masking tape strip at top */}
      <span aria-hidden="true" className="reading__maskingTape reading__maskingTape--top" />

      {/* Decorative corner botanical/star stamp */}
      <svg
        aria-hidden="true"
        className="reading__dogEarCornerCutout"
        focusable="false"
        viewBox="0 0 400 400"
      >
        <use href={`#${cutOutSymbolId(index % 2 === 0 ? 'trefoil' : 'pods')}`} />
      </svg>

      {/* Tilted polaroid cover mat */}
      <div className="reading__dogEarCoverCol" style={cardStyle}>
        <div className="reading__dogEarPolaroid">
          <div className="reading__dogEarCover">
            <BookCover book={book} extraLargeSize={148} />
          </div>
          <ScallopedStampBadge
            className="reading__dogEarPickStamp"
            tiltDeg={index % 2 === 0 ? -9 : 8}
            variant={treatment.dogEarVariant === 'terracotta' ? 'butter' : 'terracotta'}
          >
            <span>★ Dog-eared pick</span>
          </ScallopedStampBadge>
        </div>
      </div>

      {/* Library checkout / reading note slip */}
      <div className="reading__checkoutSlip">
        <div aria-hidden="true" className="reading__checkoutHeader">
          <span className="reading__checkoutLedgerLabel">Library checkout card · 5-star pick</span>
          <span className="reading__genreSticker">{treatment.genreLabel}</span>
        </div>

        <h3 className="reading__bookTitle reading__bookTitle--dogEar">{book.title}</h3>
        <p className="reading__bookAuthor">{book.author}</p>

        <div className="reading__metaRow reading__metaRow--stamped">
          <StarRating rating={book.rating} size={16} />
          {finishedLabel ? <span className="reading__date">Stamped {finishedLabel}</span> : null}
        </div>

        <blockquote className="reading__dogEarQuote">“{slipNote}”</blockquote>
        {restText ? <p className="reading__note reading__note--dogEar">{restText}</p> : null}
      </div>
    </article>
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
  if (treatment.isDogEarPick) {
    return <DogEaredFeatureCard book={book} index={index} />;
  }

  const finishedLabel = formatFinishedMonthYear(book.readDateFinished);
  const hasNote = Boolean(book.review?.trim());
  const cardStyle: CardInlineStyle = {
    '--card-offset': `${treatment.offsetPx}px`,
    '--cover-r': `${treatment.coverTiltDeg}deg`,
  };

  return (
    <PaperCard
      className={cx(
        'reading__card',
        `reading__cardMat--${treatment.matVariant}`,
        treatment.onDarkSurface ? 'reading__cardOnDark' : 'reading__cardOnLight',
        treatment.isKraft && 'reading__cardKraft',
        isWide && 'reading__cardWide',
        isWide && !hasNote && 'reading__cardWideNoNote',
      )}
      edge={treatment.edge}
      innerClassName="reading__cardInner"
      style={cardStyle}
      tiltDeg={treatment.tiltDeg}
      tone={treatment.tone}
    >
      {/* Subtle polaroid tape or corner tab on alternating cards */}
      {index % 3 === 0 ? (
        <span aria-hidden="true" className="reading__maskingTape reading__maskingTape--small" />
      ) : null}

      <div className="reading__cardTop">
        <div className="reading__coverWrap" style={cardStyle}>
          <BookCover book={book} extraLargeSize={isWide ? 116 : 100} />
        </div>
        <div className="reading__cardHead">
          <span className="reading__genreSticker reading__genreSticker--card">
            {treatment.genreLabel}
          </span>
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
                    {/* Decorative botanical + star cutouts in the year margin */}
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

                    {/* Tilted die-cut scalloped year ticket stamp */}
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

                    {/* Book count pill tucked underneath at a counter-tilt */}
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
