import type { NextPageContext } from 'next';
import NextErrorComponent from 'next/error';
import type { FetchedFallbackData } from 'api/fetchFallbackData';
import { fetchFallbackData } from 'api/fetchFallbackData';
import { ErrorLayout } from 'components/layouts/ErrorLayout';
import { PageLayout } from 'components/layouts/PageLayout';
import type { GetLayout } from 'types/Page';

export type PageProps = {
  /**
   * What kind of error we encountered
   */
  statusCode: number;
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
  const { res, err } = context;
  const errorCode = err?.statusCode ?? 500;
  const statusCode = res ? res.statusCode : errorCode;
  const { props: fallbackProps } = await fetchFallbackData(['version', 'footer']);
  return {
    props: {
      ...fallbackProps,
      ...errorProps,
      statusCode,
    },
  };
};

/**
 * Generic error page, for 500s/etc
 */
function Page() {
  return null;
}

const getLayout: GetLayout<LayoutProps> = (_page, pageProps) => (
  <PageLayout fallback={pageProps.fallback}>
    <ErrorLayout statusCode={pageProps.statusCode} />
  </PageLayout>
);

Page.getLayout = getLayout;

export default Page;
