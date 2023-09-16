import { FetchedFallbackData, fetchFallbackData } from 'api/fetchFallbackData';
import { ErrorPageContents } from 'components/errors/ErrorPageContents';
import { ErrorLayout } from 'components/layouts/ErrorLayout';
import { PageLayout } from 'components/layouts/PageLayout';
import type { GetStaticProps } from 'next/types';
import type { GetLayout } from 'types/Page';

type PageProps = {
  fallback: FetchedFallbackData<'footer' | 'version'>;
};

export const getStaticProps: GetStaticProps<PageProps> = async () =>
  fetchFallbackData(['version', 'footer']);

/**
 * Error page, for 404s specifically
 */
function Page() {
  return <ErrorPageContents statusCode={404} />;
}

const getLayout: GetLayout<PageProps> = (page, pageProps) => (
  <PageLayout fallback={pageProps.fallback}>
    <ErrorLayout statusCode={404}>{page}</ErrorLayout>
  </PageLayout>
);

Page.getLayout = getLayout;

export default Page;
