import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';

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

const MAX_DESC_LENGTH = 300;
const APP_THEME_COLOR = '#16ac7e';
const APP_BACKGROUND_COLOR = '#ffffff';
const SITE_NAME = 'Dylan Gattey';
const BASE_URL = 'https://dylangattey.com';
const OG_IMAGE_URL = 'https://og.dylangattey.com';

/**
 * Helps reduce duplication for creation of link elements
 */
const linkFromSize = (size: string, fileType: string, rel = 'icon') => (
  <link
    key={`${size}${fileType}`}
    rel={rel}
    href={`/icons/${fileType}-${size}.png`}
    sizes={`${size}x${size}`}
  />
);

/**
 * Helps reduce duplication for creation of meta elements
 */
const metaFromSize = (size: string, fileType: string, name: string) => (
  <meta key={`${size}${fileType}`} name={name} content={`/icons/${fileType}-${size}.png`} />
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
    element: (name: string) => (
      <link key={`${name}mask`} rel="mask-icon" href={`/icons/${name}`} color={APP_THEME_COLOR} />
    ),
  },
} as const;

/**
 * Populates the `<head>` of a given page from the title/description here
 */
const Meta = ({ title, description }: Props) => {
  const { asPath } = useRouter();
  const truncatedDescription =
    description && description.length > MAX_DESC_LENGTH
      ? `${description.slice(0, MAX_DESC_LENGTH)}...`
      : description;
  const resolvedTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  // Construct url with encoded periods too to not confuse the parser
  const imageTitle = title ? encodeURIComponent(title).replace(/\./g, '%2E') : '%20';
  const imageUrl = `${OG_IMAGE_URL}/${imageTitle}?md=true`;
  const pageUrl = `${BASE_URL}${asPath}`;

  const titleElements = (
    <>
      <title>{resolvedTitle}</title>
      <meta property="og:title" content={resolvedTitle} />
      <meta name="twitter:title" content={resolvedTitle} />
    </>
  );
  const descriptionElements = truncatedDescription && (
    <>
      <meta name="description" content={truncatedDescription} />
      <meta property="og:description" content={truncatedDescription} />
      <meta name="twitter:description" content={truncatedDescription} />
    </>
  );
  const urlElements = (
    <>
      <meta property="og:url" content={pageUrl} />
      <meta name="twitter:url" content={pageUrl} />
    </>
  );
  const imageElements = (
    <>
      <meta property="og:image" content={imageUrl} />
      <meta name="twitter:image" content={imageUrl} />
    </>
  );

  return (
    <Head>
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      {titleElements}
      {descriptionElements}
      {urlElements}
      {imageElements}
      <link key="favicon" rel="icon" href="/favicon.ico" />
      <meta name="theme-color" content="var(--background-color)" />
      <meta
        key="msapplication-TileColor"
        name="msapplication-TileColor"
        content={APP_BACKGROUND_COLOR}
      />
      {Object.values(ICONS).flatMap(({ variants, element }) =>
        variants.map((variant) => element(String(variant))),
      )}
    </Head>
  );
};

export default Meta;
