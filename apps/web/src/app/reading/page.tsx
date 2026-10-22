import 'server-only';
import '../collage/pills.css';
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

function ReadingStatus({ children }: { children: string }) {
  return (
    <PaperCard className="reading__status" tiltDeg={-1} tone="cream">
      <p role="status">{children}</p>
    </PaperCard>
  );
}

async function ReadingContent() {
  const books = await getBooks();
  if (books.length === 0) {
    return <ReadingStatus>No books yet.</ReadingStatus>;
  }
  return <ReadingShelf books={books} />;
}

/**
 * Page shell stays synchronous so the title commits in the same render as the
 * outgoing page and morphs into it; the shelf streams in underneath.
 */
export default function ReadingPage() {
  return (
    <section aria-label={TITLE} className="collageBackdropHost reading__layout">
      <CollageBackdrop backdrop={READING_BACKDROP} />
      <CutLetters className="collagePageTitle" text={TITLE} />
      <Suspense fallback={<ReadingStatus>Loading books…</ReadingStatus>}>
        <ReadingContent />
      </Suspense>
    </section>
  );
}
