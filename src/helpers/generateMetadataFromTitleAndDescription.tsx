import { Metadata } from 'next';
import { getTheme } from 'ui/theme';

const MAX_DESC_LENGTH = 300;
const CANONICAL_URL = 'https://dylangattey.com';
const SITE_NAME = 'Dylan Gattey';
const DEFAULT_TITLE = 'Engineer. Problem Solver.';
const OG_IMAGE_API_ROUTE = 'api/og';

/**
 * Contains non runtime-specific metadata, like basic og flags/etc
 */
export const baseMetadata: Metadata = {
  title: { default: DEFAULT_TITLE, template: `%s | ${SITE_NAME}` },
  applicationName: SITE_NAME,
  authors: { name: 'Dylan Gattey', url: CANONICAL_URL },
  referrer: 'no-referrer-when-downgrade',
  alternates: { canonical: CANONICAL_URL },
  icons: [
    {
      url: '/favicon.ico',
      sizes: '32x32',
    },
    {
      url: '/icons/icon-32.png',
      sizes: '32x32',
    },
    {
      url: '/icon.svg',
      type: 'image/svg+xml',
    },
    {
      rel: 'apple-touch-icon',
      url: '/icon-180.png',
    },
  ],
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    url: CANONICAL_URL,
    title: DEFAULT_TITLE,
    siteName: SITE_NAME,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
  },
};

/**
 * Generates the OpenGraph metadata for the page including
 * @param title Page title
 * @param description Description for the page, not truncated
 * @returns Metadata, combined with a parent
 */
export function generateMetadataFromTitleAndDescription({
  title,
  description: rawDescription,
}: {
  title?: string;
  description: string;
}): Metadata {
  const description =
    rawDescription.length > MAX_DESC_LENGTH
      ? `${rawDescription.slice(0, MAX_DESC_LENGTH)}...`
      : rawDescription;

  // Construct url-encoded title and subtitle for the og image
  const imageTitle = encodeURIComponent(title ?? SITE_NAME);
  const imageSubtitle = encodeURIComponent(title === DEFAULT_TITLE ? SITE_NAME : DEFAULT_TITLE);
  const imageUrl = `/${OG_IMAGE_API_ROUTE}/${imageTitle}?subtitle=${imageSubtitle}`;

  const theme = getTheme();
  return {
    themeColor: [
      {
        media: '(prefers-color-scheme: dark)',
        color: theme.colorSchemes.dark.palette.background.default,
      },
      {
        media: '(prefers-color-scheme: light)',
        color: theme.colorSchemes.light.palette.background.default,
      },
    ],
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl,
    },
    twitter: {
      images: imageUrl,
    },
  };
}
