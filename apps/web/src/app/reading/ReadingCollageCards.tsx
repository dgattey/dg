import type { RenderableBook } from '@dg/content-models/contentful/renderables/books';
import { Image } from '@dg/ui/dependent/Image';
import type { CSSProperties } from 'react';
import { cutOutSymbolId } from '../collage/cutOutShapes';
import { PaperCard } from '../collage/PaperCard';
import { cx } from '../collage/paperVars';
import { streamCardTreatment } from './readingCardStyles';
import { formatFinishedMonthYear, splitReviewIntoPullAndRest } from './readingHelpers';

export type CardInlineStyle = CSSProperties & {
  '--card-offset'?: string;
  '--cover-r'?: string;
  '--stamp-r'?: string;
};

/**
 * Generates an organic scalloped postage-stamp badge.
 */
export function ScallopedStampBadge({
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

export function StarRating({ rating, size = 15 }: { rating: number | null; size?: number }) {
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

export function BookCover({
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
      <span aria-hidden="true" className="reading__maskingTape reading__maskingTape--top" />

      <svg
        aria-hidden="true"
        className="reading__dogEarCornerCutout"
        focusable="false"
        viewBox="0 0 400 400"
      >
        <use href={`#${cutOutSymbolId(index % 2 === 0 ? 'trefoil' : 'pods')}`} />
      </svg>

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

export function StreamBookCard({
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
