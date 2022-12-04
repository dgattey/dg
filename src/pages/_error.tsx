import type { ErrorPageFallback } from 'api/fetchFallback';
import fetchFallback from 'api/fetchFallback';
import ErrorLayout from 'components/layouts/ErrorLayout';
import Link from 'components/Link';
import useLinkWithName from 'hooks/useLinkWithName';
import * as Sentry from '@sentry/nextjs';
import type { NextPageContext } from 'next';
import NextErrorComponent from 'next/error';
import { useRouter } from 'next/router';

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

  /**
   * Used for getting around https://github.com/vercel/next.js/issues/8592
   */
  hasStaticPropsRun: boolean;

  /**
   * The error object, for later use
   */
  err: NextPageContext['err'];

  /**
   * Current page url
   */
  pageUrl: string;
};

export type ErrorWithCode = Error & HasStatusCode;

// Error codes to title of page
const TITLE: Record<number | 'fallback', string> = {
  404: "😢 Oops, couldn't find that!",
  fallback: '😬 This is awkward...',
};

/**
 * If this is on the server, it'll provide a response to use for a status code
 */
export const getStaticProps = async (context: NextPageContext) => {
  const errorProps = await NextErrorComponent.getInitialProps(context);
  const { res, err, asPath } = context;
  const errorCode = err?.statusCode ?? 404;
  const statusCode = res ? res.statusCode : errorCode;
  const data = await fetchFallback(['version', 'footer']);
  const props: Props = {
    ...errorProps,
    statusCode,
    pageUrl: '',
    fallback: {
      ...data,
    },
    err: err ?? null,
    hasStaticPropsRun: true,
  };

  // No logging here
  if (statusCode === 404) {
    return { props };
  }

  // Non 404 captured as is, unless err is missing
  Sentry.captureException(
    err ?? new Error(`_error.tsx getStaticProps missing data at path: ${asPath}`),
  );
  await Sentry.flush(2000);
  return { props };
};

/**
 * Contents of the page in a different element so fallback can work its server-rendered magic
 */
export const Contents = ({ statusCode }: HasStatusCode) => {
  const router = useRouter();
  const emailLink = useLinkWithName('Email');
  const descriptions: Record<number | 'fallback', JSX.Element> = {
    404: (
      <>
        I didn&apos;t see a page matching the url <code>{router.asPath}</code> on the site. Check
        out the homepage and see if you can find what you were looking for. If not,
      </>
    ),
    fallback: (
      <>
        Looks like I encountered a serverside error, otherwise known as a dreaded{' '}
        {statusCode ?? 500}. Sorry! Try refreshing the page or attempting your action again. If
        it&apos;s still broken,
      </>
    ),
  };
  return (
    <>
      <h1>{(statusCode && TITLE[statusCode]) || TITLE.fallback}</h1>
      <p>
        {(statusCode && descriptions[statusCode]) || descriptions.fallback}{' '}
        {emailLink ? <Link layout="plainIconAndText" {...emailLink} /> : 'Email Me'} and I can help
        you out!
      </p>
    </>
  );
};

/**
 * Generic error page, for 404s//500s/etc
 */
const ErrorPage = ({ statusCode, fallback, hasStaticPropsRun, err, pageUrl }: Props) => {
  if (!hasStaticPropsRun && err) {
    // Workaround for https://github.com/vercel/next.js/issues/8592
    Sentry.captureException(err);
  }
  return (
    <ErrorLayout pageUrl={pageUrl} fallback={fallback} statusCode={statusCode ?? 500}>
      <Contents statusCode={statusCode} />
    </ErrorLayout>
  );
};

export default ErrorPage;
