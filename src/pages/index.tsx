import { Fallback, fetchData } from 'api/useData';
import ContentCard from 'components/ContentCard';
import ContentGrid from 'components/ContentGrid';
import Layout from 'components/Layout';
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
 * Grabs all data necessary to render all components on the homepage to
 * provide a fallback for the server side rendering done elsewhere.
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
      title="Engineer, Human"
      description="I'm Dylan, an engineer focused on building top-notch user experiences. I'm interested in React, Product Design, Sustainability, Startups, Music, and Cycling."
    />
    <Layout>
      <ContentGrid>
        <ContentCard>test</ContentCard>
        <ContentCard>test 2</ContentCard>
        <ContentCard>test 3</ContentCard>
        <ContentCard>test 4</ContentCard>
        <ContentCard>test 5</ContentCard>
        <ContentCard>test 6</ContentCard>
        <ContentCard>test 7</ContentCard>
        <ContentCard>test 8</ContentCard>
        <ContentCard>test 9</ContentCard>
      </ContentGrid>
    </Layout>
  </SWRConfig>
);

export default Home;
