import type { Fallback } from 'api/fetchFallback';
import fetchFallback from 'api/fetchFallback';
import Homepage from 'components/homepage/Homepage';
import PageLayout from 'components/layouts/PageLayout';
import { GetStaticProps, InferGetStaticPropsType } from 'next/types';
import React from 'react';

interface Props {
  /**
   * Provides SWR with fallback version data
   */
  fallback: Fallback;
}

/**
 * Grabs all data necessary to render all components on the homepage to
 * provide a fallback for the server side rendering done elsewhere.
 */
export const getStaticProps: GetStaticProps<Props> = async () => {
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
      fallback: {
        ...data,
      },
    },
  };
};

/**
 * Fallback for all data used in Homepage + its descendents, plus the homepage itself.
 */
const Home = ({ fallback }: InferGetStaticPropsType<typeof getStaticProps>) => (
  <PageLayout fallback={fallback}>
    <Homepage />
  </PageLayout>
);

export default Home;
