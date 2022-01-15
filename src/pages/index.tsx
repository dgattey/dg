import { Fallback, fetchData } from 'api/useData';
import HomepageGrid from 'components/HomepageGrid';
import Layout from 'components/Layout';
import Meta from 'components/Meta';
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
 * Homepage, 'shows' projects + other cards in a grid
 */
const Home = ({ fallback }: InferGetStaticPropsType<typeof getStaticProps>) => (
  <SWRConfig value={{ fallback }}>
    <Meta
      title="Engineer, Human"
      description="I'm Dylan, an engineer focused on building top-notch user experiences. I'm interested in React, Product Design, Sustainability, Startups, Music, and Cycling."
    />
    <Layout>
      <HomepageGrid />
    </Layout>
  </SWRConfig>
);

export default Home;
