import { FetchedFallbackData, fetchFallbackData } from 'api/fetchFallbackData';
import { PageLayout } from 'components/layouts/PageLayout';
import { Privacy } from 'components/privacy/Privacy';
import { GetServerSideProps } from 'next/types';
import { getPageUrl } from '../helpers/getPageUrl';

type PrivacyProps = {
  fallback: FetchedFallbackData<'footer' | 'version' | 'privacy'>;
  pageUrl: string;
};

/**
 * Grabs fallback data + page url
 */
export const getServerSideProps: GetServerSideProps<PrivacyProps> = async (context) => {
  const pageUrl = getPageUrl(context);
  const data = await fetchFallbackData(['footer', 'version', 'privacy']);
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
function PrivacyPage({ fallback, pageUrl }: PrivacyProps) {
  return (
    <PageLayout fallback={fallback} pageUrl={pageUrl}>
      <Privacy pageUrl={pageUrl} />
    </PageLayout>
  );
}

export default PrivacyPage;
