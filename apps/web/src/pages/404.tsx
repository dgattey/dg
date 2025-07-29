import type { FetchedFallbackData } from 'api/fetchFallbackData';
import { fetchFallbackData } from 'api/fetchFallbackData';
import type { GetStaticProps } from 'next/types';
import { ErrorLayout } from '../components/layouts/ErrorLayout';
import { PageLayout } from '../components/layouts/PageLayout';
import type { GetLayout } from '../types/Page';

type PageProps = {
  fallback: FetchedFallbackData<'footer' | 'version'>;
};

export const getStaticProps: GetStaticProps<PageProps> = async () =>
  fetchFallbackData(['version', 'footer']);

/**
 * Error page, for 404s specifically
 */
function Page() {
  return null;
}

const getLayout: GetLayout<PageProps> = (_page, pageProps) => (
  <PageLayout fallback={pageProps.fallback}>
    <ErrorLayout statusCode={404} />
  </PageLayout>
);

Page.getLayout = getLayout;

export default Page;
