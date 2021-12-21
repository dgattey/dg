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

/**
 * Populates the `<head>` of a given page from the title/description here
 */
const Meta = ({ title, description }: Props) => (
  <Head>
    <title>{title ? `Dylan Gattey - ${title}` : 'Dylan Gattey'}</title>
    {description && <meta name="description" content={description} />}
    <link rel="icon" href="/favicon.ico" />
  </Head>
);

export default Meta;
