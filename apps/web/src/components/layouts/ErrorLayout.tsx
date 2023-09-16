import { Meta } from 'components/Meta';
import { Link } from 'components/Link';
import { Section } from 'ui/Section';
import { Stack } from '@mui/material';

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
    </>
  );
}
