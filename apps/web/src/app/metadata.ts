import { COLORS } from '@dg/ui/theme/color';
import type { Metadata, Viewport } from 'next';

export const SITE_NAME = 'Dylan Gattey';
export const HOMEPAGE_TITLE = 'Engineer. Problem Solver.';
// Max length for meta descriptions before truncation.
export const MAX_DESC_LENGTH = 300;

const toUrl = (value: string) => {
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return new URL(value);
  }
  return new URL(`https://${value}`);
};

const resolveMetadataBase = () => {
  const explicitBase = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicitBase) {
    return toUrl(explicitBase);
  }
  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (productionUrl) {
    return toUrl(productionUrl);
  }
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return toUrl(vercelUrl);
  }
  return new URL('http://localhost:3000');
};

export const metadataBase = resolveMetadataBase();

/**
 * Base metadata applied to all pages unless overridden.
 */
export const baseOpenGraph: NonNullable<Metadata['openGraph']> = {
  locale: 'en_US',
  siteName: SITE_NAME,
  type: 'website',
  url: '/',
};

export const baseTwitter: NonNullable<Metadata['twitter']> = {
  card: 'summary_large_image',
};

export const baseMetadata: Metadata = {
  description: SITE_NAME,
  icons: {
    apple: '/apple-touch-icon.png',
    icon: [
      { sizes: '32x32', url: '/favicon.ico' },
      { media: '(prefers-color-scheme: light)', type: 'image/svg+xml', url: '/icon-light.svg' },
      { media: '(prefers-color-scheme: dark)', type: 'image/svg+xml', url: '/icon-dark.svg' },
    ],
  },
  manifest: '/manifest.webmanifest',
  metadataBase,
  openGraph: baseOpenGraph,
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  twitter: baseTwitter,
};

export const viewport: Viewport = {
  themeColor: [
    { color: COLORS.LIGHT.DEFAULT_BACKGROUND, media: '(prefers-color-scheme: light)' },
    { color: COLORS.DARK.DEFAULT_BACKGROUND, media: '(prefers-color-scheme: dark)' },
  ],
};

/**
 * Truncates description text to a meta-friendly length.
 */
export const truncateDescription = (description?: string | null) => {
  if (!description) {
    return undefined;
  }
  return description.length > MAX_DESC_LENGTH
    ? `${description.slice(0, MAX_DESC_LENGTH)}...`
    : description;
};
