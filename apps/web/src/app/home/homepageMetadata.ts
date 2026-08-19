import { homeRoute } from '@dg/shared-core/routes/app';
import type { Metadata } from 'next';
import { getHomepageDescription } from '../../services/homepage';
import { markdownAlternates } from '../layouts/markdownAlternates';
import { baseOpenGraph, baseTwitter, HOMEPAGE_TITLE, truncateDescription } from '../metadata';

export async function generateHomepageMetadata(): Promise<Metadata> {
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
