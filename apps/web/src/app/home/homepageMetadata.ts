import { homeRoute } from '@dg/shared-core/routes/app';
import type { Metadata } from 'next';
import { getHomepageDescription } from '../../services/homepage';
import { markdownAlternates } from '../layouts/markdownAlternates';
import { baseOpenGraph, baseTwitter, HOMEPAGE_TITLE, truncateDescription } from '../metadata';

/**
 * Metadata for the homepage, shared by both routes that can render it.
 *
 * `/` and the interactive rewrite target are the same page to the outside
 * world, so they must describe themselves identically — same title, same
 * description, same `/` URL — whichever one the proxy picked.
 */
export async function generateHomepageMetadata(): Promise<Metadata> {
  const description = truncateDescription(await getHomepageDescription());

  return {
    alternates: markdownAlternates(homeRoute),
    description,
    openGraph: {
      ...baseOpenGraph,
      description,
      title: HOMEPAGE_TITLE,
      url: homeRoute,
    },
    // Absolute so both routes render the same <title>. The root layout's
    // `%s | Dylan Gattey` template applies to child segments but not to
    // `app/page.tsx`, which shares the root segment — so a bare string would
    // give the interactive route a suffix `/` never had.
    title: { absolute: HOMEPAGE_TITLE },
    twitter: {
      ...baseTwitter,
      description,
      title: HOMEPAGE_TITLE,
    },
  };
}
