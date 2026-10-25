import 'server-only';
import '../collage/pills.css';
import '../music/stats/statsShapes.css';
import './reading.css';

import { readingRoute } from '@dg/shared-core/routes/app';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getBooks } from '../../services/contentful';
import { READING_BACKDROP } from '../collage/backdrops';
import { CollageBackdrop } from '../collage/CollageBackdrop';
import { CutLetters } from '../collage/CutLetters';
import { PaperStatus } from '../collage/PaperCard';
import { markdownAlternates } from '../layouts/markdownAlternates';
import { ReadingShelf } from './ReadingShelf';

const TITLE = 'Reading';

export const metadata: Metadata = {
  alternates: markdownAlternates(readingRoute),
  description: 'Books read, star ratings, and notes by year.',
  title: TITLE,
};

async function ReadingContent() {
  const books = await getBooks();
  if (books.length === 0) {
    return <PaperStatus>No books yet.</PaperStatus>;
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
      <Suspense fallback={<PaperStatus>Loading books…</PaperStatus>}>
        <ReadingContent />
      </Suspense>
    </section>
  );
}
