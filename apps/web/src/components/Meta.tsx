import { useTheme } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'ui/theme/useColorScheme';
import { HOMEPAGE_TITLE } from './Meta.constants';

type MetaProps = {
  /**
   * Tab/window title that shows in a browser
   */
  title?: string;

  /**
   * Description shown to Google/others
   */
  description?: string;
};

/**
 * Maps from graph item names like "url" for "og:url"/"twitter:url" to their
 * content, like "https://example" or "undefined"
 */
type Graph = Record<string, string | undefined>;

const MAX_DESC_LENGTH = 300;
const SITE_NAME = 'Dylan Gattey';
const OG_IMAGE_API_ROUTE = 'api/og';
const GRAPH_PREFIXES = ['og', 'twitter'] as const;

/**
 * Small helper to create og: and twitter: elements for keys + content
 */
const graphMetaItems = (graph: Graph) =>
  Object.entries(graph).map(([name, content]) =>
    GRAPH_PREFIXES.map((prefix) =>
      content ? (
        <meta content={content} key={`${prefix}:${name}graphmeta`} property={`${prefix}:${name}`} />
      ) : undefined,
    ),
  );

/**
 * Populates the `<head>` of a given page from the title/description here
 */
export function Meta({ title, description }: MetaProps) {
  const router = useRouter();
  const [pageUrl, setPageUrl] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const { colorScheme } = useColorScheme();

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
  const imageSubtitle = encodeURIComponent(title ? SITE_NAME : HOMEPAGE_TITLE);
  const theme = useTheme();

  return (
    <Head>
      <meta content={SITE_NAME} key="og:site_name" property="og:site_name" />
      <meta content="en_US" key="og:locale" property="og:locale" />
      <meta content="website" key="og:type" property="og:type" />
      <meta content="summary_large_image" key="twitter:card" name="twitter:card" />
      <title key="title">{resolvedTitle}</title>
      {truncatedDescription ? (
        <meta content={truncatedDescription} key="description" name="description" />
      ) : null}
      {graphMetaItems({
        description: truncatedDescription,
        image: `${baseUrl}/${OG_IMAGE_API_ROUTE}/${imageTitle}?subtitle=${imageSubtitle}`,
        title: title ?? SITE_NAME,
        url: pageUrl,
      })}
      <meta content={theme.vars.palette.background.default} key="theme-color" name="theme-color" />
      <link href="/favicon.ico" key="favicon" rel="icon" sizes="32x32" />
      <link
        href={`/icon${colorScheme.mode === 'dark' ? '-dark' : '-light'}.svg`}
        key="svg-icon"
        rel="icon"
        type="image/svg+xml"
      />
      <link href="/apple-touch-icon.png" key="apple-touch" rel="apple-touch-icon" />
      <link href="/manifest.webmanifest" key="manifest" rel="manifest" />
    </Head>
  );
}
