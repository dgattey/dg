import { linkWithName } from 'api/contentful/fetchSiteFooter';
import useData, { FallbackForErrorPages, fetchData } from 'api/useData';
import ErrorLayout from 'components/layouts/ErrorLayout';
import Link from 'components/Link';
import type { NextApiResponse } from 'next';
import React from 'react';
import { SWRConfig } from 'swr';

interface HasStatusCode {
  /**
   * What kind of error we encountered
   */
  statusCode?: number;
}

type Props = HasStatusCode & {
  /**
   * Provides SWR with fallback version data
   */
  fallback: FallbackForErrorPages;
};

type ErrorWithCode = Error & HasStatusCode;

/**
 * If this is on the server, it'll provide a response to use for a status code
 */
export const getStaticProps = async ({
  res,
  err,
}: {
  res: NextApiResponse;
  err: ErrorWithCode;
}) => {
  const errorCode = err?.statusCode ?? 404;
  const statusCode = res ? res.statusCode : errorCode;
  const data = await fetchData(['version', 'siteFooter', 'siteHeader']);
  return {
    props: {
      statusCode,
      fallback: {
        ...data,
      },
    },
  };
};

/**
 * Contents of the page in a different element so fallback can work its server-rendered magic
 */
const Contents = ({ statusCode }: HasStatusCode) => {
  const { data: footerLinks } = useData('siteFooter');
  const emailLink = linkWithName(footerLinks, 'Email');
  return (
    <ErrorLayout>
      <h1>😬 This is awkward...</h1>
      <p>
        Looks like I encountered a {statusCode === 404 ? <code>Page Not Found</code> : 'server'}{' '}
        error, otherwise known as a dreaded {statusCode ?? 500}. Sorry! Try refreshing the page or
        attempting your action again. If it&apos;s still broken,{' '}
        {emailLink ? <Link alwaysShowTitle {...emailLink} /> : 'Email Me'} and I&apos;ll see what I
        can do.
      </p>
    </ErrorLayout>
  );
};

/**
 * Generic error page, for 500s
 */
const ErrorPage = ({ statusCode, fallback }: Props) => (
  <SWRConfig value={{ fallback }}>
    <Contents statusCode={statusCode} />
  </SWRConfig>
);

export default ErrorPage;
