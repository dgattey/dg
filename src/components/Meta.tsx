import Head from 'next/head';
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

/**
 * Organizes and maps icon file sizes/names to their created elements - keep this
 * up to date with everything in public/icons/*.png
 */
const ICONS = {
  generic: {
    variants: [32, 144, 192, 228],
    element: (size: string) => (
      <link
        key={`${size}generic`}
        rel="icon"
        href={`/icons/favicon-${size}.png`}
        sizes={`${size}x${size}`}
      />
    ),
  },
  android: {
    variants: [96, 128, 144, 192, 196, 512],
    element: (size: string) => (
      <link
        key={`${size}android`}
        rel="icon"
        href={`/icons/prerounded-${size}.png`}
        sizes={`${size}x${size}`}
      />
    ),
  },
  ios: {
    variants: [57, 76, 120, 152, 167, 180, 512, 1024],
    element: (size: string) => (
      <link
        key={`${size}ios`}
        rel="apple-touch-icon"
        href={`/icons/touch-icon-${size}.png`}
        sizes={`${size}x${size}`}
      />
    ),
  },
  windows: {
    variants: [144],
    element: (size: string) => (
      <meta
        key={`${size}windows`}
        name="msapplication-TileImage"
        content={`/icons/favicon-${size}.png`}
      />
    ),
  },
  thumbnail: {
    variants: [152],
    element: (size: string) => (
      <meta key={`${size}thumb`} name="thumbnail" content={`/icons/touch-icon-${size}.png`} />
    ),
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
  const truncatedDescription =
    description && description.length > MAX_DESC_LENGTH
      ? `${description.slice(0, MAX_DESC_LENGTH)}...`
      : description;

  return (
    <Head>
      <title>{title ? `Dylan Gattey - ${title}` : 'Dylan Gattey'}</title>
      {truncatedDescription && <meta name="description" content={truncatedDescription} />}
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
