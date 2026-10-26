import type { RenderableBook } from '@dg/content-models/contentful/renderables/books';
import { collageCardTreatment } from '../collage/collageCardTreatment';
import { CoverCard, ReviewCard } from './ReadingCards';
import { ReadingFilterController } from './ReadingFilterController';
import { ReadingHero } from './ReadingHero';
import {
  bookCardKind,
  bookFilterKeys,
  featuredBook,
  readingFilterOptions,
  shelfSections,
  shelfStats,
  sortBooks,
} from './readingHelpers';

/** Paper comes from the unfiltered shelf position, so a card keeps its look as it moves. */
function ShelfCard({ book, shelfIndex }: { book: RenderableBook; shelfIndex: number }) {
  const treatment = collageCardTreatment(shelfIndex);
  const kind = bookCardKind(book);
  switch (kind) {
    case 'cover':
      return <CoverCard book={book} treatment={treatment} />;
    case 'feature':
    case 'review':
      return (
        <ReviewCard book={book} flip={shelfIndex % 2 === 1} kind={kind} treatment={treatment} />
      );
    default: {
      const unhandled: never = kind;
      return unhandled;
    }
  }
}

export function ReadingShelf({ books }: { books: ReadonlyArray<RenderableBook> }) {
  const shelf = sortBooks(books);
  const featured = featuredBook(shelf);
  const shelfIndexById = new Map(shelf.map((book, index) => [book.id, index]));

  const sections = shelfSections(shelf).map((section) => ({
    books: section.books.map((book) => ({
      card: <ShelfCard book={book} shelfIndex={shelfIndexById.get(book.id) ?? 0} />,
      ...(book.id === featured?.book.id ? { featuredInHero: true as const } : {}),
      id: book.id,
      matches: bookFilterKeys(book),
    })),
    label: section.label,
  }));

  return (
    <ReadingFilterController
      filterOptions={readingFilterOptions(shelf)}
      hero={
        featured
          ? {
              id: featured.book.id,
              node: <ReadingHero featured={featured} stats={shelfStats(shelf)} />,
            }
          : null
      }
      sections={sections}
    />
  );
}
