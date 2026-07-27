import { homeRoute, htmlPathToMarkdownPath } from '@dg/shared-core/routes/app';
import type { Metadata } from 'next';
import { getHomepageDescription } from '../services/homepage';
import { absoluteUrl } from '../services/markdown/siteUrl';
import { Homepage } from './home/Homepage';
import { MarkdownAlternateHint } from './layouts/MarkdownAlternateHint';
import { baseOpenGraph, baseTwitter, HOMEPAGE_TITLE, truncateDescription } from './metadata';

const markdownPath = htmlPathToMarkdownPath(homeRoute) ?? '/index.md';

export async function generateMetadata(): Promise<Metadata> {
  const description = truncateDescription(await getHomepageDescription());

  return {
    alternates: {
      types: {
        'text/markdown': markdownPath,
      },
    },
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

export default function Page() {
  return (
    <>
      <MarkdownAlternateHint markdownUrl={absoluteUrl(markdownPath)} />
      <Homepage />
    </>
  );
}
