import { Fallback, fetchData } from 'api/useData';
import Footer from 'components/Footer';
import Meta from 'components/Meta';
import { GetStaticProps, InferGetStaticPropsType } from 'next/types';
import React from 'react';
import { SWRConfig } from 'swr';

interface Props {
  /**
   * Provides SWR with fallback version data
   */
  fallback: Fallback<'version'>;
}

/**
 * Grabs version and returns it as fallback
 */
export const getStaticProps: GetStaticProps<Props> = async () => {
  const version = await fetchData('version');
  return {
    props: {
      fallback: {
        version,
      },
    },
  };
};

/**
 * Homepage, shows dummy data for now, with real data in footer
 */
const Home = ({ fallback }: InferGetStaticPropsType<typeof getStaticProps>) => (
  <SWRConfig value={{ fallback }}>
    <Meta
      title="Product-focused engineer"
      description="I'm Dylan, an engineer focused on building top-notch user experiences. I'm interested in React, Product Design, Sustainability, Startups, Music, and Cycling."
    />
    <header>Header</header>
    <main>Thing</main>
    <Footer />
  </SWRConfig>
);

export default Home;
