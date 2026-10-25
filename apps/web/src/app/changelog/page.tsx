import 'server-only';
import '../collage/pills.css';
import '../music/stats/statsShapes.css';
import './changelog.css';

import { changelogRoute } from '@dg/shared-core/routes/app';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getChangelogReleases } from '../../services/github';
import { HISTORY_BACKDROP } from '../collage/backdrops';
import { CollageBackdrop } from '../collage/CollageBackdrop';
import { CutLetters } from '../collage/CutLetters';
import { PaperStatus } from '../collage/PaperCard';
import { markdownAlternates } from '../layouts/markdownAlternates';
import { ChangelogLedger } from './ChangelogLedger';

const TITLE = 'Changelog';
const DESCRIPTION = 'Version history and release notes.';

export const metadata: Metadata = {
  alternates: markdownAlternates(changelogRoute),
  description: DESCRIPTION,
  title: TITLE,
};

async function ChangelogContent() {
  const releases = await getChangelogReleases();
  if (releases.length === 0) {
    return <PaperStatus>No releases found.</PaperStatus>;
  }
  return <ChangelogLedger releases={releases} />;
}

export default function ChangelogPage() {
  return (
    <section aria-label={TITLE} className="collageBackdropHost changelog__layout">
      <CollageBackdrop backdrop={HISTORY_BACKDROP} />
      <CutLetters className="collagePageTitle" text={TITLE} />
      <Suspense fallback={<PaperStatus>Loading releases…</PaperStatus>}>
        <ChangelogContent />
      </Suspense>
    </section>
  );
}
