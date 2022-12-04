import { ErrorPageFallback } from 'api/fetchFallback';
import Meta from 'components/Meta';
import { Page } from 'types/Page';
import NextLink from 'next/link';
import styled from 'styled-components';
import PageLayout from './PageLayout';

type Props = Pick<React.ComponentProps<'div'>, 'children'> &
  Pick<Page, 'pageUrl'> & {
    /**
     * Provides SWR with fallback version/header/footer data
     */
    fallback: ErrorPageFallback;

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
const ErrorLayout = ({ children, fallback, statusCode, pageUrl }: Props) => {
  const pageTitle = statusCode === 404 ? 'Oops! Page not found' : `Error code ${statusCode}`;
  return (
    <PageLayout fallback={fallback} pageUrl={pageUrl}>
      <Meta pageUrl={pageUrl} title={pageTitle} description="An error occurred" />
      <Container>
        {children}
        <NextLink href="/" role="button">
          Go back home
        </NextLink>
      </Container>
    </PageLayout>
  );
};

export default ErrorLayout;
