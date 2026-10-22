import type { RenderableBook } from '@dg/content-models/contentful/renderables/books';
import { Image } from '@dg/ui/dependent/Image';
import type { CollageCardTreatment } from '../collage/collageCardTreatment';
import { PaperCard } from '../collage/PaperCard';
import { PaperTag } from '../collage/PaperTag';
import { cx } from '../collage/paperVars';
import type { PaperEdge, PaperTone } from '../collage/types';
import { type BookCardKind, formatFinishedDate } from './readingHelpers';

type CardLook = { coverWidth: number; edge: PaperEdge; tiltScale: number };

/** Bigger paper tilts less, so wide cards stay readable and cover prints get the swing. */
const CARD_LOOKS: Record<BookCardKind, CardLook> = {
  cover: { coverWidth: 220, edge: 'quad-b', tiltScale: 1.4 },
  feature: { coverWidth: 220, edge: 'soft-b', tiltScale: 0.4 },
  review: { coverWidth: 140, edge: 'quad-a', tiltScale: 0.7 },
};

/** Light slips read on every card tone, so a cream card takes an ochre slip instead. */
function slipTone(cardTone: PaperTone): PaperTone {
  return cardTone === 'cream' ? 'ochre' : 'cream';
}

export function BookCover({
  book,
  preload = false,
  width,
}: {
  book: RenderableBook;
  preload?: boolean;
  width: number;
}) {
  return (
    <div className="reading__cover">
      {book.thumbnail ? (
        <Image
          alt=""
          cover={true}
          fetchPriority={preload ? 'high' : undefined}
          height={book.thumbnail.height}
          preload={preload}
          sizes={{ extraLarge: width, tiny: 200 }}
          url={book.thumbnail.url}
          width={book.thumbnail.width}
        />
      ) : null}
    </div>
  );
}

/** Stars and finished date as inline pieces, for a meta line or a stamp. */
export function BookMeta({ book, withYear }: { book: RenderableBook; withYear: boolean }) {
  const finished =
    book.readingStatus === 'read' ? formatFinishedDate(book.readDateFinished, { withYear }) : null;
  return (
    <>
      {book.rating === null ? null : (
        <span aria-label={`${book.rating} out of 5 stars`} className="reading__stars" role="img">
          {'★'.repeat(book.rating)}
          <span className="reading__starsEmpty">{'★'.repeat(5 - book.rating)}</span>
        </span>
      )}
      {finished ? <span>{finished}</span> : null}
    </>
  );
}

function hasMeta(book: RenderableBook): boolean {
  return book.rating !== null || (book.readingStatus === 'read' && book.readDateFinished !== null);
}

function CoverPrint({ book, width }: { book: RenderableBook; width: number }) {
  return (
    <div className="reading__print">
      <BookCover book={book} width={width} />
      {book.rating === 5 ? (
        <span aria-hidden="true" className="reading__seal">
          5★
        </span>
      ) : null}
    </div>
  );
}

/** A reviewed book. Wide cards sit the cover beside the slip, alternating sides down the shelf. */
export function ReviewCard({
  book,
  flip,
  kind,
  treatment,
}: {
  book: RenderableBook;
  flip: boolean;
  kind: 'feature' | 'review';
  treatment: CollageCardTreatment;
}) {
  const look = CARD_LOOKS[kind];
  return (
    <PaperCard
      className={cx('reading__card', `reading__card--${kind}`, flip && 'reading__card--flip')}
      edge={look.edge}
      innerClassName="reading__reviewInner"
      tiltDeg={treatment.tiltDeg * look.tiltScale}
      tone={treatment.tone}
    >
      <CoverPrint book={book} width={look.coverWidth} />
      <div className="reading__head">
        <h3 className="reading__bookTitle">{book.title}</h3>
        <p className="reading__author">{book.author}</p>
        {hasMeta(book) ? (
          <PaperTag
            className="reading__stamp"
            edge="quad-d"
            tiltDeg={flip ? 2.5 : -2.5}
            tone={slipTone(treatment.tone)}
          >
            <BookMeta book={book} withYear={false} />
          </PaperTag>
        ) : null}
      </div>
      <PaperCard
        className="reading__slip"
        edge="torn-c"
        innerClassName="reading__slipInner"
        tiltDeg={flip ? -0.6 : 0.6}
        tone={slipTone(treatment.tone)}
      >
        <p>{book.review}</p>
      </PaperCard>
    </PaperCard>
  );
}

/** A book with no review, as a small tilted print. */
export function CoverCard({
  book,
  treatment,
}: {
  book: RenderableBook;
  treatment: CollageCardTreatment;
}) {
  const look = CARD_LOOKS.cover;
  return (
    <PaperCard
      className="reading__card reading__card--cover"
      edge={look.edge}
      innerClassName="reading__coverInner"
      tiltDeg={treatment.tiltDeg * look.tiltScale}
      tone={treatment.tone}
    >
      <CoverPrint book={book} width={look.coverWidth} />
      <h3 className="reading__bookTitle">{book.title}</h3>
      <p className="reading__author">{book.author}</p>
      {hasMeta(book) ? (
        <p className="reading__meta">
          <BookMeta book={book} withYear={false} />
        </p>
      ) : null}
    </PaperCard>
  );
}
