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

/**
 * Organizes and maps icon file sizes/names - keep this
 * up to date with everything in public/icons/*.png
 */
const ICONS = {
  generic: [32, 144, 192, 228],
  android: [96, 128, 144, 192, 196, 512],
  manifest: [128, 192, 512],
  ios: [57, 76, 120, 152, 167, 180, 512, 1024],
  windows: [144],
  thumbnail: [152],
  mask: ['safari-pinned-tab.svg'],
} as const;

/**
 * Populates the `<head>` of a given page from the title/description here
 */
const Meta = ({ title, description }: Props) => {
  const truncatedDescription =
    description && description.length > MAX_DESC_LENGTH
      ? `${description.slice(0, MAX_DESC_LENGTH)}...`
      : description;

  // Maps all icons
  const icons = [
    <link key="favicon" rel="icon" href="/favicon.ico" />,
    ...ICONS.generic.map((size) => (
      <link
        key={`generic${size}`}
        rel="icon"
        href={`/icons/favicon-${size}.png`}
        sizes={`${size}x${size}`}
      />
    )),
    ...ICONS.thumbnail.map((size) => (
      <meta key={`thumbnail${size}`} name="thumbnail" content={`/icons/touch-icon-${size}.png`} />
    )),
    ...ICONS.android.map((size) => (
      <link
        key={`android${size}`}
        rel="icon"
        href={`/icons/prerounded-${size}.png`}
        sizes={`${size}x${size}`}
      />
    )),
    ...ICONS.ios.map((size) => (
      <link
        key={`ios${size}`}
        rel="apple-touch-icon"
        href={`/icons/touch-icon-${size}.png`}
        sizes={`${size}x${size}`}
      />
    )),
    ...ICONS.mask.map((name) => (
      <link key={`mask${name}`} rel="mask-icon" href={`/icons/${name}`} color="#16ac7e" />
    )),
    <meta key="msapplication-TileColor" name="msapplication-TileColor" content="#ffffff" />,
    ...ICONS.windows.map((size) => (
      <meta
        key={`windows${size}`}
        name="msapplication-TileImage"
        content={`/icons/favicon-${size}.png`}
      />
    )),
  ];

  return (
    <Head>
      <title>{title ? `Dylan Gattey - ${title}` : 'Dylan Gattey'}</title>
      {truncatedDescription && <meta name="description" content={truncatedDescription} />}
      {icons}
    </Head>
  );
};

export default Meta;
