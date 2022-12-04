import fetchFallback from 'api/fetchFallback';
import Homepage from 'components/homepage/Homepage';
import PageLayout from 'components/layouts/PageLayout';
import getPageUrl from 'helpers/getPageUrl';
import type { Page } from 'types/Page';
import type { GetServerSideProps } from 'next/types';

export type HomeProps = Page<
  'projects' | 'intro' | 'location' | 'latest/activity' | 'latest/track'
>;

/**
 * Grabs fallback data + page url
 */
export const getServerSideProps: GetServerSideProps<HomeProps> = async (context) => {
  const pageUrl = getPageUrl(context);
  const data = await fetchFallback([
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
