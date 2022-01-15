import { Fallback, fetchData } from 'api/useData';
import Homepage from 'components/homepage/Homepage';
import Layout from 'components/Layout';
import { GetStaticProps, InferGetStaticPropsType } from 'next/types';
import React from 'react';
import { SWRConfig } from 'swr';

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
  const data = await fetchData([
    'version',
    'siteFooter',
    'siteHeader',
    'projects',
    'introBlock',
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
  <SWRConfig value={{ fallback }}>
    <Layout>
      <Homepage />
    </Layout>
  </SWRConfig>
);

export default Home;
