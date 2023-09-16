import { FetchedFallbackData, fetchFallbackData } from 'api/fetchFallbackData';
import { ErrorPageContents } from 'components/errors/ErrorPageContents';
import { ErrorLayout } from 'components/layouts/ErrorLayout';
import { PageLayout } from 'components/layouts/PageLayout';
import type { NextPageContext } from 'next';
import NextErrorComponent from 'next/error';
import type { GetLayout } from 'types/Page';

export type PageProps = {
  /**
   * What kind of error we encountered
   */
  statusCode?: number;
};

type LayoutProps = PageProps & {
  /**
   * Provides SWR with fallback version data
   */
  fallback: FetchedFallbackData<'version' | 'footer'>;
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
  const props: PageProps = {
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
 * Generic error page, for 500s/etc
 */
function Page({ statusCode }: PageProps) {
  return <ErrorPageContents statusCode={statusCode} />;
}

const getLayout: GetLayout<LayoutProps> = (page, pageProps) => (
  <PageLayout fallback={pageProps.fallback}>
    <ErrorLayout statusCode={pageProps.statusCode ?? 500}>{page}</ErrorLayout>
  </PageLayout>
);

Page.getLayout = getLayout;

export default Page;
