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
        <ContentCard>Hi</ContentCard>
        <ContentCard verticalSpan={2}>Spans wide</ContentCard>
        <ContentCard horizontalSpan={2}>Spans tall</ContentCard>
        <ContentCard>I&apos;m regular</ContentCard>
        <ContentCard isClickable>Here is card 5</ContentCard>
        <ContentCard verticalSpan={2}>Sixth element</ContentCard>
        <ContentCard>Third to last (7)</ContentCard>
        <ContentCard horizontalSpan={2} isClickable>
          8
        </ContentCard>
        <ContentCard>Ninth and last</ContentCard>
      </ContentGrid>
    </Layout>
  </SWRConfig>
);

export default Home;
