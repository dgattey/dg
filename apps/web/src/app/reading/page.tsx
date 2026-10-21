import 'server-only';
import './reading.css';

import { readingRoute } from '@dg/shared-core/routes/app';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getBooks } from '../../services/contentful';
import { READING_BACKDROP } from '../collage/backdrops';
import { CollageBackdrop } from '../collage/CollageBackdrop';
import { CutLetters } from '../collage/CutLetters';
import { PaperCard } from '../collage/PaperCard';
import { markdownAlternates } from '../layouts/markdownAlternates';
import { ReadingShelf } from './ReadingShelf';

const TITLE = 'Reading';

export const metadata: Metadata = {
  alternates: markdownAlternates(readingRoute),
  description: 'Books read, star ratings, and notes by year.',
  title: TITLE,
};

function ReadingSkeleton() {
  return (
    <div aria-label="Loading reading list" role="status">
      <div className="reading__titleRow">
        <CutLetters className="collagePageTitle reading__title" text={TITLE} />
      </div>
      <PaperCard className="reading__feature" edge="soft-a" tiltDeg={-0.5} tone="viridian">
        <div className="reading__empty">Loading reading shelf…</div>
      </PaperCard>
    </div>
  );
}

async function ReadingContent() {
  const books = await getBooks();

  if (books.length === 0) {
    return (
      <>
        <div className="reading__titleRow">
          <CutLetters className="collagePageTitle reading__title" text={TITLE} />
        </div>
        <PaperCard edge="soft-a" tiltDeg={-0.5} tone="cream">
          <p className="reading__empty">No books on the shelf yet.</p>
        </PaperCard>
      </>
    );
  }

  return <ReadingShelf books={books} title={TITLE} />;
}

export default function ReadingPage() {
  return (
    <section aria-label={TITLE} className="collageBackdropHost reading__layout">
      <CollageBackdrop backdrop={READING_BACKDROP} />
      <Suspense fallback={<ReadingSkeleton />}>
        <ReadingContent />
      </Suspense>
    </section>
  );
}
