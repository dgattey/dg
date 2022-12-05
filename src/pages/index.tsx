import { FetchedFallbackData, fetchFallbackData } from 'api/fetchFallbackData';
import { Homepage } from 'components/homepage/Homepage';
import { PageLayout } from 'components/layouts/PageLayout';
import type { GetStaticProps } from 'next/types';

type HomeProps = {
  fallback: FetchedFallbackData<
    'version' | 'footer' | 'projects' | 'intro' | 'location' | 'latest/track' | 'latest/activity'
  >;
};

export const getStaticProps: GetStaticProps<HomeProps> = async () =>
  fetchFallbackData([
    'version',
    'footer',
    'projects',
    'intro',
    'location',
    'latest/track',
    'latest/activity',
  ]);

function Home({ fallback }: HomeProps) {
  return (
    <PageLayout fallback={fallback}>
      <Homepage />
    </PageLayout>
  );
}

export default Home;
