import { Typography } from '@mui/material';
import { FetchedFallbackData, fetchFallbackData } from 'api/fetchFallbackData';
import { ErrorLayout } from 'components/layouts/ErrorLayout';
import { Link } from 'components/Link';
import { useLinkWithName } from 'hooks/useLinkWithName';
import type { NextPageContext } from 'next';
import NextErrorComponent from 'next/error';
import { useRouter } from 'next/router';

interface HasStatusCode {
  /**
   * What kind of error we encountered
   */
  statusCode?: number;
}

export type ErrorPageProps = HasStatusCode & {
  /**
   * Provides SWR with fallback version data
   */
  fallback: FetchedFallbackData<'version' | 'footer'>;
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
  const { props: fallbackProps } = await fetchFallbackData(['version', 'footer']);
  const props: ErrorPageProps = {
    ...fallbackProps,
    ...errorProps,
    statusCode,
  };

  // No logging here
  if (statusCode === 404) {
    return { props };
  }

  // Non 404 captured as is, unless err is missing
  // eslint-disable-next-line no-console
  console.error(
    err ?? new Error(`_error.tsx getStaticProps missing data at path: ${asPath ?? 'unknown path'}`),
  );
  return { props };
};

/**
 * Contents of the page in a different element so fallback can work its server-rendered magic
 */
export function Contents({ statusCode }: HasStatusCode) {
  const router = useRouter();
  const emailLink = useLinkWithName('Email');
  const descriptions: Record<number | 'fallback', JSX.Element> = {
    404: (
      <>
        I didn&apos;t see a page matching the url{' '}
        <Typography variant="code" component="code">
          {router.asPath}
        </Typography>{' '}
        on the site. Check out the homepage and see if you can find what you were looking for. If
        not,
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
      <Typography variant="h1">{(statusCode && TITLE[statusCode]) || TITLE.fallback}</Typography>
      <Typography variant="body1" sx={{ maxWidth: '35em' }}>
        {(statusCode && descriptions[statusCode]) || descriptions.fallback}{' '}
        {emailLink ? <Link layout="iconText" {...emailLink} href={emailLink.url} /> : 'Email Me'}{' '}
        and I can help you out!
      </Typography>
    </>
  );
}

/**
 * Generic error page, for 404s//500s/etc
 */
function ErrorPage({ statusCode, fallback }: ErrorPageProps) {
  return (
    <ErrorLayout fallback={fallback} statusCode={statusCode ?? 500}>
      <Contents statusCode={statusCode} />
    </ErrorLayout>
  );
}

export default ErrorPage;
