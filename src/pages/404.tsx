import { fetchFallbackData } from 'api/fetchFallbackData';
import { ErrorLayout } from 'components/layouts/ErrorLayout';
import type { GetStaticProps } from 'next/types';
import { Contents, ErrorPageProps } from './_error';

export const getStaticProps: GetStaticProps = async () => fetchFallbackData(['version', 'footer']);

/**
 * Error page, for 404s specifically
 */
function Error404Page({ fallback }: ErrorPageProps) {
  return (
    <ErrorLayout fallback={fallback} statusCode={404}>
      <Contents statusCode={404} />
    </ErrorLayout>
  );
}

export default Error404Page;
