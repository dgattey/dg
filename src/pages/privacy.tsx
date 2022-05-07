import type { PartialFallback } from 'api/fetchFallback';
import fetchFallback from 'api/fetchFallback';
import PageLayout from 'components/layouts/PageLayout';
import Privacy from 'components/privacy/Privacy';
import { GetStaticProps, InferGetStaticPropsType } from 'next/types';
import React from 'react';

interface Props {
  /**
   * Provides SWR with fallback version data
   */
  fallback: PartialFallback<'privacy'>;
}

/**
 * Grabs all data necessary to render all components on the privacy page to
 * provide a fallback for the server side rendering done elsewhere.
 */
export const getStaticProps: GetStaticProps<Props> = async () => {
  const data = await fetchFallback(['footer', 'version', 'privacy']);
  return {
    props: {
      fallback: {
        ...data,
      },
    },
  };
};

/**
 * Fallback for all data used in privacy page + its descendents
 */
const PrivacyPage = ({ fallback }: InferGetStaticPropsType<typeof getStaticProps>) => (
  <PageLayout fallback={fallback}>
    <Privacy />
  </PageLayout>
);

export default PrivacyPage;
