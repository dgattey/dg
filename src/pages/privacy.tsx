import { FetchedFallbackData, fetchFallbackData } from 'api/fetchFallbackData';
import { PageLayout } from 'components/layouts/PageLayout';
import { Privacy } from 'components/privacy/Privacy';
import { GetStaticProps } from 'next/types';

type PrivacyProps = {
  fallback: FetchedFallbackData<'footer' | 'version' | 'privacy'>;
};

export const getStaticProps: GetStaticProps<PrivacyProps> = async () =>
  fetchFallbackData(['footer', 'version', 'privacy']);

function PrivacyPage({ fallback }: PrivacyProps) {
  return (
    <PageLayout fallback={fallback}>
      <Privacy />
    </PageLayout>
  );
}

export default PrivacyPage;
