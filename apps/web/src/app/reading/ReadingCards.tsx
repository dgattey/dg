import type { RenderableBook } from '@dg/content-models/contentful/renderables/books';
import { Image } from '@dg/ui/dependent/Image';
import type { CollageCardTreatment } from '../collage/collageCardTreatment';
import { PaperCard } from '../collage/PaperCard';
import { PaperTag } from '../collage/PaperTag';
import { cx } from '../collage/paperVars';
import { type FeaturedBook, formatFinishedDate } from './readingHelpers';

function BookCover({
  book,
  className,
  preload = false,
  width,
}: {
  book: RenderableBook;
  className?: string;
  preload?: boolean;
  width: number;
}) {
  return (
    <div className={cx('reading__cover', className)}>
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

function BookMeta({ book, withYear }: { book: RenderableBook; withYear: boolean }) {
  const finished =
    book.readingStatus === 'read' ? formatFinishedDate(book.readDateFinished, { withYear }) : null;
  if (book.rating === null && finished === null) {
    return null;
  }
  return (
    <p className="reading__meta">
      {book.rating === null ? null : (
        <span aria-label={`${book.rating} out of 5 stars`} className="reading__stars" role="img">
          {'★'.repeat(book.rating)}
          <span className="reading__starsEmpty">{'★'.repeat(5 - book.rating)}</span>
        </span>
      )}
      {finished ? <span>{finished}</span> : null}
    </p>
  );
}

export function FeaturedBookCard({ featured: { book, tag } }: { featured: FeaturedBook }) {
  return (
    <PaperCard
      className="reading__feature"
      edge="soft-a"
      innerClassName="reading__featureInner"
      tiltDeg={-1}
      tone="cream"
    >
      <BookCover book={book} className="reading__featureCover" preload={true} width={240} />
      <div className="reading__featureBody">
        <PaperTag className="reading__featureTag" tiltDeg={-2.5} tone="ochre">
          {tag}
        </PaperTag>
        <h2 className="reading__featureTitle">{book.title}</h2>
        <p className="reading__author">{book.author}</p>
        <BookMeta book={book} withYear={true} />
        {book.review ? <p className="reading__featureReview">{book.review}</p> : null}
      </div>
    </PaperCard>
  );
}

export function BookCard({
  book,
  treatment,
}: {
  book: RenderableBook;
  treatment: CollageCardTreatment;
}) {
  return (
    <PaperCard
      className="reading__book"
      edge="quad-a"
      innerClassName="reading__bookInner"
      tiltDeg={treatment.tiltDeg}
      tone={treatment.tone}
    >
      <BookCover book={book} width={260} />
      <h3 className="reading__title">{book.title}</h3>
      <p className="reading__author">{book.author}</p>
      <BookMeta book={book} withYear={false} />
      {book.review ? (
        <details className="reading__note">
          <summary>
            <span className="reading__review">{book.review}</span>
          </summary>
        </details>
      ) : null}
    </PaperCard>
  );
}
