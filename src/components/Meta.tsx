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
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};

export default Meta;
