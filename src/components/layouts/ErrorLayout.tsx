import { ErrorPageFallback } from 'api/fetchFallback';
import NextLink from 'next/link';
import styled from 'styled-components';
import PageLayout from './PageLayout';

type Props = Pick<React.ComponentProps<'div'>, 'children'> & {
  /**
   * Provides SWR with fallback version/header/footer data
   */
  fallback: ErrorPageFallback;
};

const Button = styled.a.attrs({ role: 'button' })``;

const Container = styled.section`
  max-width: 36em;
  margin-bottom: 8rem;
`;

/**
 * Basic page layout for error pages. Max-width'd content, left aligned,
 * with a go home button at the bottom
 */
const ErrorLayout = ({ children, fallback }: Props) => (
  <PageLayout fallback={fallback}>
    <Container>
      {children}
      <NextLink passHref href="/">
        <Button>Go Back Home</Button>
      </NextLink>
    </Container>
  </PageLayout>
);

export default ErrorLayout;
