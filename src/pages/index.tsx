import { Fallback, fetchData } from 'api/useData';
import Layout from 'components/Layout';
import Meta from 'components/Meta';
import ProjectGrid from 'components/ProjectGrid';
import { GetStaticProps, InferGetStaticPropsType } from 'next/types';
import React from 'react';
import { SWRConfig } from 'swr';

interface Props {
  /**
   * Provides SWR with fallback version data
   */
  fallback: Fallback<'version' | 'siteFooter' | 'siteHeader' | 'projects'>;
}

/**
 * Grabs all data necessary to render all components on the homepage to
 * provide a fallback for the server side rendering done elsewhere.
 */
export const getStaticProps: GetStaticProps<Props> = async () => {
  const [version, siteFooter, siteHeader, projects] = await Promise.all([
    fetchData('version'),
    fetchData('siteFooter'),
    fetchData('siteHeader'),
    fetchData('projects'),
  ]);
  return {
    props: {
      fallback: {
        version,
        siteFooter,
        siteHeader,
        projects,
      },
    },
  };
};

/**
 * Homepage, shows projects + other cards in a grid
 */
const Home = ({ fallback }: InferGetStaticPropsType<typeof getStaticProps>) => (
  <SWRConfig value={{ fallback }}>
    <Meta
      title="Engineer, Human"
      description="I'm Dylan, an engineer focused on building top-notch user experiences. I'm interested in React, Product Design, Sustainability, Startups, Music, and Cycling."
    />
    <Layout>
      <ProjectGrid />
    </Layout>
  </SWRConfig>
);

export default Home;
