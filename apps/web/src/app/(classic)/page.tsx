import { homeRoute } from '@dg/shared-core/routes/app';
import type { Metadata, ResolvingMetadata } from 'next';
import { getHomepageDescription } from '../../services/homepage';
import { Homepage } from '../home/Homepage';
import { markdownAlternates } from '../layouts/markdownAlternates';
import { baseOpenGraph, baseTwitter, HOMEPAGE_TITLE, truncateDescription } from '../metadata';

/**
 * The social images are file metadata on the root segment, and this page's own openGraph and
 * twitter objects replace the parent's wholesale, so their images are carried over explicitly.
 */
export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const [homepageDescription, { openGraph, twitter }] = await Promise.all([
    getHomepageDescription(),
    parent,
  ]);
  const description = truncateDescription(homepageDescription);

  return {
    alternates: markdownAlternates(homeRoute),
    description,
    openGraph: {
      ...baseOpenGraph,
      description,
      images: openGraph?.images,
      title: HOMEPAGE_TITLE,
      url: '/',
    },
    title: { absolute: HOMEPAGE_TITLE },
    twitter: {
      ...baseTwitter,
      description,
      images: twitter?.images,
      title: HOMEPAGE_TITLE,
    },
  };
}

export default function Page() {
  return <Homepage />;
}
