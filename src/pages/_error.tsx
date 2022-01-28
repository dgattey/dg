import type { ErrorPageFallback } from 'api/fetchFallback';
import fetchFallback from 'api/fetchFallback';
import { findLinkWithName } from 'api/parsers';
import useData from 'api/useData';
import ErrorLayout from 'components/layouts/ErrorLayout';
import Link from 'components/Link';
import type { NextApiResponse } from 'next';
import React from 'react';

interface HasStatusCode {
  /**
   * What kind of error we encountered
   */
  statusCode?: number;
}

export type Props = HasStatusCode & {
  /**
   * Provides SWR with fallback version data
   */
  fallback: ErrorPageFallback;
};

export type ErrorWithCode = Error & HasStatusCode;

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
  const data = await fetchFallback(['version', 'footer', 'header']);
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
  const { data: footerLinks } = useData('footer');
  const emailLink = findLinkWithName(footerLinks, 'Email');
  return (
    <>
      <h1>😬 This is awkward...</h1>
      <p>
        Looks like I encountered a {statusCode === 404 ? <code>Page Not Found</code> : 'server'}{' '}
        error, otherwise known as a dreaded {statusCode ?? 500}. Sorry! Try refreshing the page or
        attempting your action again. If it&apos;s still broken,{' '}
        {emailLink ? <Link layout="plainIconAndText" {...emailLink} /> : 'Email Me'} and I&apos;ll
        see what I can do.
      </p>
    </>
  );
};

/**
 * Generic error page, for 500s
 */
const ErrorPage = ({ statusCode, fallback }: Props) => (
  <ErrorLayout fallback={fallback}>
    <Contents statusCode={statusCode} />
  </ErrorLayout>
);

export default ErrorPage;
