import { alpha, darken, lighten, Stack, Typography } from '@mui/material';
import { Section } from 'ui/core/Section';
import { Link } from 'ui/dependent/Link';
import { useColorScheme } from 'ui/theme/useColorScheme';
import { Meta } from 'components/Meta';

type ErrorLayoutProps = {
  /**
   * The numeric code for the error's status
   */
  statusCode: number;
};

/**
 * Basic page layout for error pages. Max-width'd content, left aligned,
 * with a go home button at the bottom
 */
export function ErrorLayout({ statusCode }: ErrorLayoutProps) {
  const pageTitle = statusCode === 404 ? 'Page not found' : 'Oops!';
  const {
    colorScheme: { isInitialized, mode },
  } = useColorScheme();
  return (
    <>
      <Meta description="An error occurred" title={pageTitle} />
      <Stack component={Section} sx={{ gap: 3, marginTop: -8, alignItems: 'center' }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: '280px !important',
            backgroundImage: 'url(/images/error-small.jpg)',
            backgroundClip: 'text',
            backgroundSize: 'cover',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            fontWeight: 900,
            fontStretch: 'extra-expanded',
            filter: (t) =>
              isInitialized
                ? `drop-shadow(2px 2px 12px ${darken(alpha(t.palette.secondary.dark, 0.4), 0.8)})`
                : null,
            WebkitTextStroke: '1px',
            WebkitTextStrokeColor: (t) =>
              isInitialized
                ? mode === 'light'
                  ? darken(t.palette.background.paper, 0.6)
                  : lighten(t.palette.background.paper, 0.1)
                : null,
          }}
        >
          {statusCode}
        </Typography>
        <Typography sx={{ maxWidth: '26em', textWrap: 'balance' }} variant="h5" textAlign="center">
          {statusCode === 404
            ? 'Sorry, got lost in the jungle. Email me if something is wrong.'
            : 'Something went super wrong, sorry. Email me to let me know.'}
        </Typography>
        <Link
          buttonProps={{
            color: 'secondary',
          }}
          href="/"
          isButton
          sx={{ marginTop: 3 }}
          title="Home"
        >
          Back home
        </Link>
      </Stack>
    </>
  );
}
