import type { Metadata } from 'next';
import { Homepage } from '../components/homepage/Homepage';
import { getHomepageDescription } from '../services/homepage';
import { HOMEPAGE_TITLE, truncateDescription } from './metadata';

export async function generateMetadata(): Promise<Metadata> {
  const description = truncateDescription(await getHomepageDescription());

  return {
    description,
    openGraph: {
      description,
      title: HOMEPAGE_TITLE,
      url: '/',
    },
    title: HOMEPAGE_TITLE,
    twitter: {
      description,
      title: HOMEPAGE_TITLE,
    },
  };
}

export default function Page() {
  return <Homepage />;
}
