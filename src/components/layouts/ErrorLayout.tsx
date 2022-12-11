import { Meta } from 'components/Meta';
import { FetchedFallbackData } from 'api/fetchFallbackData';
import type { EndpointKey } from 'api/endpoints';
import { Link } from 'components/Link';
import { Section } from 'ui/Section';
import { Stack } from '@mui/material';
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
      <Stack component={Section} sx={{ gap: 3, marginTop: -6 }}>
        {children}
        <Link
          isButton
          buttonProps={{
            color: 'secondary',
          }}
          href="/"
          title="Home"
          sx={{ alignSelf: 'flex-start', marginTop: 3 }}
        >
          Go back home
        </Link>
      </Stack>
    </PageLayout>
  );
}
