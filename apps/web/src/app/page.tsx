import { homeRoute } from '@dg/shared-core/routes/app';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getHomepageDescription } from '../services/homepage';
import { ContentGridHomepage, Homepage } from './home/Homepage';
import { HomepageFallback } from './home/HomepageFallback';
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
 * evaluation reads request-time cookies, so the choice can't live in the
 * prerendered static shell — it streams into a Suspense hole. The fallback is
 * the first paint everyone gets, so it renders a static, data-free terrain wash
 * rather than blank content; the chosen layout (grid or world) then streams in
 * from cached data as part of the same response.
 *
 * Everything behind that hole is swapped in by React's inline scripts, so with
 * scripting off it would never arrive and the homepage would be permanently
 * blank — which is why the grid is also emitted in a `noscript`. Scripted
 * visitors never render it, and everyone else gets the cards, links and copy
 * rather than an empty gradient. `force-dynamic` would avoid the hole entirely
 * but cache components rejects it.
 */
export default function Page() {
  return (
    <>
      <Suspense fallback={<HomepageFallback />}>
        <Homepage />
      </Suspense>
      <noscript>
        <ContentGridHomepage />
      </noscript>
    </>
  );
}
