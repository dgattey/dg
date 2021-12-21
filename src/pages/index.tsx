import { Fallback, fetchData } from 'api/useData';
import Footer from 'components/Footer';
import Header from 'components/Header';
import Meta from 'components/Meta';
import { GetStaticProps, InferGetStaticPropsType } from 'next/types';
import React from 'react';
import { SWRConfig } from 'swr';

interface Props {
  /**
   * Provides SWR with fallback version data
   */
  fallback: Fallback<'version' | 'siteFooter' | 'siteHeader'>;
}

/**
 * Grabs version and returns it as fallback
 */
export const getStaticProps: GetStaticProps<Props> = async () => {
  const [version, siteFooter, siteHeader] = await Promise.all([
    fetchData('version'),
    fetchData('siteFooter'),
    fetchData('siteHeader'),
  ]);
  return {
    props: {
      fallback: {
        version,
        siteFooter,
        siteHeader,
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
    <Header />
    <main>Main body</main>
    <Footer />
  </SWRConfig>
);

export default Home;
