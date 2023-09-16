import { Theme, useTheme } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface Props {
  /**
   * Tab/window title that shows in a browser
   */
  title?: string;

  /**
   * Description shown to Google/others
   */
  description?: string;
}

/**
 * Maps from graph item names like "url" for "og:url"/"twitter:url" to their
 * content, like "https://example" or "undefined"
 */
type Graph = Record<string, string | undefined>;

const MAX_DESC_LENGTH = 300;
const SITE_NAME = 'Dylan Gattey';
export const HOMEPAGE_TITLE = 'Engineer. Problem Solver.';
const OG_IMAGE_API_ROUTE = 'api/og';
const GRAPH_PREFIXES = ['og', 'twitter'] as const;

/**
 * Helps reduce duplication for creation of link elements
 */
const linkFromSize = (size: string, fileType: string, rel = 'icon') => (
  <link
    key={`${size}${fileType}link`}
    rel={rel}
    href={`/icons/${fileType}-${size}.png`}
    sizes={`${size}x${size}`}
  />
);

/**
 * Helps reduce duplication for creation of meta elements
 */
const metaFromSize = (size: string, fileType: string, name: string) => (
  <meta key={`${size}${fileType}meta`} name={name} content={`/icons/${fileType}-${size}.png`} />
);

/**
 * Organizes and maps icon file sizes/names to their created elements - keep this
 * up to date with everything in public/icons/*.png
 */
const ICONS = {
  generic: {
    variants: [32, 144, 192, 228],
    element: (size: string) => linkFromSize(size, 'favicon'),
  },
  android: {
    variants: [96, 128, 144, 192, 196, 512],
    element: (size: string) => linkFromSize(size, 'prerounded'),
  },
  ios: {
    variants: [57, 76, 120, 152, 167, 180, 512, 1024],
    element: (size: string) => linkFromSize(size, 'touch-icon', 'apple-touch-icon'),
  },
  windows: {
    variants: [144],
    element: (size: string) => metaFromSize(size, 'favicon', 'msapplication-TileImage'),
  },
  thumbnail: {
    variants: [152],
    element: (size: string) => metaFromSize(size, 'touch-icon', 'thumbnail'),
  },
  mask: {
    variants: ['safari-pinned-tab.svg'],
    element: (name: string, theme: Theme) => (
      <link
        key={`${name}mask`}
        rel="mask-icon"
        href={`/icons/${name}`}
        color={theme.vars.palette.primary.main}
      />
    ),
  },
} as const;

/**
 * Small helper to create og: and twitter: elements for keys + content
 */
const graphMetaItems = (graph: Graph) =>
  Object.entries(graph).map(([name, content]) =>
    GRAPH_PREFIXES.map((prefix) =>
      content ? (
        <meta key={`${prefix}:${name}graphmeta`} property={`${prefix}:${name}`} content={content} />
      ) : undefined,
    ),
  );

/**
 * Populates the `<head>` of a given page from the title/description here
 */
export function Meta({ title, description }: Props) {
  const router = useRouter();
  const [pageUrl, setPageUrl] = useState('');
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    const { host } = window.location;
    const newBaseUrl = `https://${host}`;
    setBaseUrl(newBaseUrl);
    setPageUrl(`${newBaseUrl}${router.pathname}`);
  }, [router.pathname]);

  const truncatedDescription =
    description && description.length > MAX_DESC_LENGTH
      ? `${description.slice(0, MAX_DESC_LENGTH)}...`
      : description;
  const resolvedTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  // Construct url-encoded title and subtitle for the og image
  const imageTitle = encodeURIComponent(title ?? SITE_NAME);
  const imageSubtitle = encodeURIComponent(title === HOMEPAGE_TITLE ? SITE_NAME : HOMEPAGE_TITLE);
  const theme = useTheme();

  return (
    <Head>
      <meta key="og:site_name" property="og:site_name" content={SITE_NAME} />
      <meta key="og:locale" property="og:locale" content="en_US" />
      <meta key="og:type" property="og:type" content="website" />
      <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
      <title key="title">{resolvedTitle}</title>
      {truncatedDescription && (
        <meta key="description" name="description" content={truncatedDescription} />
      )}
      {graphMetaItems({
        title: title ?? SITE_NAME,
        description: truncatedDescription,
        url: pageUrl,
        image: `${baseUrl}/${OG_IMAGE_API_ROUTE}/${imageTitle}?subtitle=${imageSubtitle}`,
      })}
      <link key="favicon" rel="icon" href="/favicon.ico" />
      <meta key="theme-color" name="theme-color" content={theme.vars.palette.background.default} />
      <meta
        key="msapplication-TileColor"
        name="msapplication-TileColor"
        content={theme.vars.palette.background.default}
      />
      {Object.values(ICONS).flatMap(({ variants, element }) =>
        variants.map((variant) => element(String(variant), theme)),
      )}
    </Head>
  );
}
