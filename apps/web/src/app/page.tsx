import { homeRoute } from '@dg/shared-core/routes/app';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getHomepageDescription } from '../services/homepage';
import { Homepage } from './home/Homepage';
import { markdownAlternates } from './layouts/markdownAlternates';
import { baseOpenGraph, baseTwitter, HOMEPAGE_TITLE, truncateDescription } from './metadata';

export async function generateMetadata(): Promise<Metadata> {
  const description = truncateDescription(await getHomepageDescription());

  return {
    alternates: markdownAlternates(homeRoute),
    description,
    openGraph: {
      ...baseOpenGraph,
      description,
      title: HOMEPAGE_TITLE,
      url: '/',
    },
    title: HOMEPAGE_TITLE,
    twitter: {
      ...baseTwitter,
      description,
      title: HOMEPAGE_TITLE,
    },
  };
}

/**
 * The homepage layout is chosen by the `interactive-redesign` flag, and flag
 * evaluation reads request-time cookies, so the choice lives in a Suspense hole
 * rather than the prerendered shell. Both layouts are built from cached data, so
 * the hole resolves as part of the same streamed response.
 */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <Homepage />
    </Suspense>
  );
}
