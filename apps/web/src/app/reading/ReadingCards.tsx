import type { RenderableBook } from '@dg/content-models/contentful/renderables/books';
import { Image } from '@dg/ui/dependent/Image';
import type { CSSProperties } from 'react';
import { type CutOutShape, cutOutSymbolId } from '../collage/cutOutShapes';
import { PaperCard } from '../collage/PaperCard';
import { PaperTag } from '../collage/PaperTag';
import { cx } from '../collage/paperVars';
import {
  formatFinishedMonthYear,
  inferBookGenre,
  splitReviewIntoPullAndRest,
  streamCardTreatment,
} from './readingHelpers';

type CardInlineStyle = CSSProperties & Record<`--${string}`, string | number>;
type CutOutGlyphProps = {
  className?: string;
  shape: CutOutShape;
  size?: number;
  style?: CSSProperties;
};

export function CutOutGlyph({ className, shape, size, style }: CutOutGlyphProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      height={size}
      style={style}
      viewBox="0 0 400 400"
      width={size}
    >
      <use href={`#${cutOutSymbolId(shape)}`} />
    </svg>
  );
}

type StampProps = {
  children: React.ReactNode;
  className?: string;
  tiltDeg?: number;
  variant?: 'butter' | 'terracotta';
};

export function ScallopedStampBadge({
  children,
  className,
  tiltDeg = 0,
  variant = 'terracotta',
}: StampProps) {
  return (
    <span
      className={cx('reading__scallopStamp', `reading__scallopStamp--${variant}`, className)}
      style={{ '--stamp-r': `${tiltDeg}deg` } as CardInlineStyle}
    >
      <span className="reading__scallopStampInner">{children}</span>
    </span>
  );
}

export function StarRating({ rating, size = 15 }: { rating: number | null; size?: number }) {
  if (rating === null || rating < 1) {
    return null;
  }
  const clamped = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span aria-label={`${clamped} out of 5 stars`} className="reading__stars" role="img">
      {[1, 2, 3, 4, 5].map((i) => (
        <CutOutGlyph
          className={cx('reading__star', i <= clamped ? 'reading__starOn' : 'reading__starEmpty')}
          key={i}
          shape="star5"
          size={size}
        />
      ))}
    </span>
  );
}

type BookCoverProps = { book: RenderableBook; extraLargeSize: number; preload?: boolean };

export function BookCover({ book, extraLargeSize, preload = false }: BookCoverProps) {
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

const HERO_MATS = [
  [
    'terracotta',
    'M38,44 C180,8 410,26 640,12 C820,2 958,28 984,96 C1006,158 988,288 962,364 C934,412 760,416 510,404 C250,392 54,414 20,352 C-8,296 8,144 38,44 Z',
  ],
  [
    'butter',
    'M18,28 C210,-6 490,18 760,6 C910,-2 982,38 992,124 C1002,216 978,342 938,388 C884,422 620,402 360,412 C130,420 22,386 10,312 C-2,232 4,88 18,28 Z',
  ],
] as const;

const HERO_CUTOUTS: ReadonlyArray<readonly [CutOutShape, CardInlineStyle]> = [
  ['monstera', { '--c': 'var(--leaf)', '--r': '-22deg', '--s': '96px', left: -30, top: -34 }],
  ['fern', { '--c': 'var(--viridian)', '--r': '28deg', '--s': '88px', bottom: -28, right: -28 }],
  ['star5', { '--c': 'var(--ochre)', '--r': '14deg', '--s': '38px', right: 240, top: -22 }],
  ['star4', { '--c': 'var(--rose)', '--r': '-18deg', '--s': '34px', bottom: -18, left: 205 }],
];

type HeroProps = { book: RenderableBook; fiveStarTotal: number; totalBookCount: number };

export function NightstandHeroCollage({ book, totalBookCount, fiveStarTotal }: HeroProps) {
  const finishedLabel = formatFinishedMonthYear(book.readDateFinished);
  const { pullQuote, restText } = splitReviewIntoPullAndRest(book.review);
  const genre = inferBookGenre(book, 0);
  const progressText = book.readingStatus === 'reading' ? '68% read' : '68% read · finished';

  return (
    <div className="reading__heroStage">
      {HERO_MATS.map(([mod, d]) => (
        <svg
          aria-hidden="true"
          className={`reading__heroMatBack reading__heroMatBack--${mod}`}
          focusable="false"
          key={mod}
          preserveAspectRatio="none"
          viewBox="0 0 1000 420"
        >
          <path d={d} />
        </svg>
      ))}
      {HERO_CUTOUTS.map(([shape, style]) => (
        <CutOutGlyph className="reading__heroCutout" key={shape} shape={shape} style={style} />
      ))}
      <ScallopedStampBadge className="reading__nightstandStamp" tiltDeg={-11} variant="terracotta">
        <CutOutGlyph className="reading__stampIcon" shape="star5" />
        <span>On the nightstand</span>
      </ScallopedStampBadge>
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
              <CutOutGlyph shape="star5" size={16} />
              <span>Latest read</span>
            </span>
            <span className="reading__genreSticker reading__genreSticker--hero">{genre}</span>
          </div>
          <h2 className="reading__featureTitle">{book.title}</h2>
          <p className="reading__featureAuthor">{book.author}</p>
          <div className="reading__featureMeta">
            <StarRating rating={book.rating} size={17} />
            <span className="reading__date">
              {finishedLabel ? `Finished ${finishedLabel}` : 'Reading now'}
            </span>
          </div>
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

type StreamCardProps = { book: RenderableBook; index: number; isWide: boolean };

export function StreamBookCard({ book, index, isWide }: StreamCardProps) {
  const t = streamCardTreatment(book, index);
  const finishedLabel = formatFinishedMonthYear(book.readDateFinished);
  const coverStyle: CardInlineStyle = { '--cover-r': `${t.coverTiltDeg}deg` };

  if (t.isDogEarPick) {
    const { pullQuote, restText } = splitReviewIntoPullAndRest(book.review);
    const slipNote =
      pullQuote ??
      'Five-star shelf favorite — dog-eared and kept on the top stack to hand to friends.';
    return (
      <article
        className={cx(
          'reading__dogEarCard',
          `reading__dogEarCard--${t.dogEarVariant}`,
          index % 2 === 1 && 'reading__dogEarCard--reverse',
        )}
        style={{ '--r': `${t.tiltDeg}deg` } as CardInlineStyle}
      >
        <span aria-hidden="true" className="reading__maskingTape reading__maskingTape--top" />
        <CutOutGlyph
          className="reading__dogEarCornerCutout"
          shape={index % 2 === 0 ? 'trefoil' : 'pods'}
        />
        <div className="reading__dogEarCoverCol" style={coverStyle}>
          <div className="reading__dogEarPolaroid">
            <div className="reading__dogEarCover">
              <BookCover book={book} extraLargeSize={148} />
            </div>
            <ScallopedStampBadge
              className="reading__dogEarPickStamp"
              tiltDeg={index % 2 === 0 ? -9 : 8}
              variant={t.dogEarVariant === 'terracotta' ? 'butter' : 'terracotta'}
            >
              <span>★ Dog-eared pick</span>
            </ScallopedStampBadge>
          </div>
        </div>
        <div className="reading__checkoutSlip">
          <div aria-hidden="true" className="reading__checkoutHeader">
            <span className="reading__checkoutLedgerLabel">
              Library checkout card · 5-star pick
            </span>
            <span className="reading__genreSticker">{t.genreLabel}</span>
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

  const hasNote = Boolean(book.review?.trim());
  const cardStyle: CardInlineStyle = {
    '--card-offset': `${t.offsetPx}px`,
    '--cover-r': `${t.coverTiltDeg}deg`,
    '--pc': t.matPc,
  };

  return (
    <PaperCard
      className={cx(
        'reading__card',
        'reading__cardOnLight',
        isWide && 'reading__cardWide',
        isWide && !hasNote && 'reading__cardWideNoNote',
      )}
      edge={t.edge}
      innerClassName="reading__cardInner"
      style={cardStyle}
      tiltDeg={t.tiltDeg}
      tone="cream"
    >
      {index % 3 === 0 ? (
        <span aria-hidden="true" className="reading__maskingTape reading__maskingTape--small" />
      ) : null}
      <div className="reading__cardTop">
        <div className="reading__coverWrap" style={coverStyle}>
          <BookCover book={book} extraLargeSize={isWide ? 116 : 100} />
        </div>
        <div className="reading__cardHead">
          <span className="reading__genreSticker reading__genreSticker--card">{t.genreLabel}</span>
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
