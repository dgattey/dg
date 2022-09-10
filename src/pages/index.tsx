import fetchFallback from '@dg/api/fetchFallback';
import Homepage from '@dg/components/homepage/Homepage';
import PageLayout from '@dg/components/layouts/PageLayout';
import getPageUrl from '@dg/helpers/getPageUrl';
import type { Page } from '@dg/types/Page';
import type { GetServerSideProps } from 'next/types';

type Props = Page<'projects' | 'intro' | 'location' | 'latest/activity' | 'latest/track'>;

/**
 * Grabs fallback data + page url
 */
export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
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
const Home = ({ fallback, pageUrl }: Props) => (
  <PageLayout fallback={fallback} pageUrl={pageUrl}>
    <Homepage pageUrl={pageUrl} />
  </PageLayout>
);

export default Home;
