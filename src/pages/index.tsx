import useData, { Fallback, fetchData } from 'api/useData';
import ContentGrid from 'components/ContentGrid';
import Layout from 'components/Layout';
import Meta from 'components/Meta';
import ProjectCard from 'components/ProjectCard';
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
const Home = ({ fallback }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { data: projects } = useData('projects');
  return (
    <SWRConfig value={{ fallback }}>
      <Meta
        title="Engineer, Human"
        description="I'm Dylan, an engineer focused on building top-notch user experiences. I'm interested in React, Product Design, Sustainability, Startups, Music, and Cycling."
      />
      <Layout>
        <ContentGrid>
          {projects?.map((project) => (
            <ProjectCard key={project.title} {...project} />
          ))}
        </ContentGrid>
      </Layout>
    </SWRConfig>
  );
};

export default Home;
