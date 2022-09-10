import fetchFallback from '@dg/api/fetchFallback';
import PageLayout from '@dg/components/layouts/PageLayout';
import Privacy from '@dg/components/privacy/Privacy';
import type { Page } from '@dg/types/Page';
import { GetServerSideProps } from 'next/types';
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
