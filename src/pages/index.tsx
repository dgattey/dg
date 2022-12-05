import { FetchedFallbackData, fetchFallbackData } from 'api/fetchFallbackData';
import { Homepage } from 'components/homepage/Homepage';
import { PageLayout } from 'components/layouts/PageLayout';
import { getPageUrl } from 'helpers/getPageUrl';
import type { GetServerSideProps } from 'next/types';

type HomeProps = {
  fallback: FetchedFallbackData<
    'version' | 'footer' | 'projects' | 'intro' | 'location' | 'latest/track' | 'latest/activity'
  >;
  pageUrl: string;
};

/**
 * Grabs fallback data + page url
 */
export const getServerSideProps: GetServerSideProps<HomeProps> = async (context) => {
  const pageUrl = getPageUrl(context);
  const data = await fetchFallbackData([
    'version',
    'footer',
    'projects',
    'intro',
    'location',
    'latest/track',
    'latest/activity',
  ]);
  return {
    props: {
      pageUrl,
      fallback: {
        ...data,
      },
    },
  };
};

/**
 * Fallback for all data used in Homepage + its descendents, plus the homepage itself.
 */
function Home({ fallback, pageUrl }: HomeProps) {
  return (
    <PageLayout fallback={fallback} pageUrl={pageUrl}>
      <Homepage pageUrl={pageUrl} />
    </PageLayout>
  );
}

export default Home;
