import { Stack } from '@mui/material';
import { Meta } from 'components/Meta';
import { Link } from 'components/Link';
import { Section } from 'ui/Section';

type ErrorLayoutProps = {
  children: React.ReactNode;

  /**
   * The numeric code for the error's status
   */
  statusCode: number;
};

/**
 * Basic page layout for error pages. Max-width'd content, left aligned,
 * with a go home button at the bottom
 */
export function ErrorLayout({ children, statusCode }: ErrorLayoutProps) {
  const pageTitle = statusCode === 404 ? 'Oops! Page not found' : `Error code ${statusCode}`;
  return (
    <>
      <Meta description="An error occurred" title={pageTitle} />
      <Stack component={Section} sx={{ gap: 3, marginTop: -6 }}>
        {children}
        <Link
          buttonProps={{
            color: 'secondary',
          }}
          href="/"
          isButton
          sx={{ alignSelf: 'flex-start', marginTop: 3 }}
          title="Home"
        >
          Go back home
        </Link>
      </Stack>
    </>
  );
}
