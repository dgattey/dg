import fetchFallback from 'api/fetchFallback';
import PageLayout from 'components/layouts/PageLayout';
import Privacy from 'components/privacy/Privacy';
import { GetServerSideProps } from 'next/types';
import React from 'react';
import type { Page } from 'types/Page';
import getPageUrl from '../helpers/getPageUrl';

type Props = Page<'privacy'>;

/**
 * Grabs fallback data + page url
 */
export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const pageUrl = getPageUrl(context);
  const data = await fetchFallback(['footer', 'version', 'privacy']);
  return {
    props: {
      pageUrl,
      fallback: {
        ...data,
      },
    },
  };
};

/**
 * Fallback for all data used in privacy page + its descendents
 */
const PrivacyPage = ({ fallback, pageUrl }: Props) => (
  <PageLayout fallback={fallback} pageUrl={pageUrl}>
    <Privacy pageUrl={pageUrl} />
  </PageLayout>
);

export default PrivacyPage;
