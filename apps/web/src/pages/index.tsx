import type { GetStaticProps } from 'next/types';
import type { FetchedFallbackData } from 'api/fetchFallbackData';
import { fetchFallbackData } from 'api/fetchFallbackData';
import { Homepage } from 'components/homepage/Homepage';
import { PageLayout } from 'components/layouts/PageLayout';
import type { GetLayout } from 'types/Page';

type PageProps = {
  fallback: FetchedFallbackData<
    'version' | 'footer' | 'projects' | 'intro' | 'location' | 'latest/track' | 'latest/activity'
  >;
};

export const getStaticProps: GetStaticProps<PageProps> = async () =>
  fetchFallbackData([
    'version',
    'footer',
    'projects',
    'intro',
    'location',
    'latest/track',
    'latest/activity',
  ]);

function Page() {
  return <Homepage />;
}

const getLayout: GetLayout<PageProps> = (page, pageProps) => (
  <PageLayout fallback={pageProps.fallback}>{page}</PageLayout>
);

Page.getLayout = getLayout;

export default Page;
