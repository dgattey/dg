import { Meta } from 'components/Meta';
import NextLink from 'next/link';
import styled from '@emotion/styled';
import { FetchedFallbackData } from 'api/fetchFallbackData';
import type { EndpointKey } from 'api/endpoints';
import { PageLayout } from './PageLayout';

type ErrorLayoutProps<Keys extends EndpointKey> = {
  children: React.ReactNode;

  /**
   * Provides SWR with fallback version/header/footer data
   */
  fallback: FetchedFallbackData<Keys>;

  /**
   * The numeric code for the error's status
   */
  statusCode: number;
};

const Container = styled.section`
  max-width: 36em;
  margin-bottom: 8rem;
`;

/**
 * Basic page layout for error pages. Max-width'd content, left aligned,
 * with a go home button at the bottom
 */
export function ErrorLayout<Keys extends EndpointKey>({
  children,
  fallback,
  statusCode,
}: ErrorLayoutProps<Keys>) {
  const pageTitle = statusCode === 404 ? 'Oops! Page not found' : `Error code ${statusCode}`;
  return (
    <PageLayout fallback={fallback}>
      <Meta title={pageTitle} description="An error occurred" />
      <Container>
        {children}
        <NextLink href="/" role="button">
          Go back home
        </NextLink>
      </Container>
    </PageLayout>
  );
}
