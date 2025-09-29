import { Stack, Typography } from '@mui/material';
import { Section } from 'ui/core/Section';
import { Link } from 'ui/dependent/Link';
import { useColorScheme } from 'ui/theme/useColorScheme';
import { Meta } from '../Meta';

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
    colorScheme: { isInitialized },
  } = useColorScheme();
  return (
    <>
      <Meta description="An error occurred" title={pageTitle} />
      <Stack component={Section} sx={{ alignItems: 'center', gap: 3, marginTop: -8 }}>
        <Typography
          sx={(theme) => ({
            backgroundClip: 'text',
            backgroundImage: 'url(/images/error-small.webp)',
            backgroundSize: 'cover',
            color: 'transparent',
            filter: isInitialized
              ? `drop-shadow(2px 2px 12px hsl(from ${theme.vars.palette.secondary.dark} h s calc(l * 0.2) / 0.4))`
              : null,
            fontSize: '280px !important',
            fontStretch: 'extra-expanded',
            fontWeight: 900,
            WebkitBackgroundClip: 'text',
            WebkitTextStroke: `1px ${theme.vars.palette.secondary.main}`,
          })}
          variant="h1"
        >
          {statusCode}
        </Typography>
        <Typography sx={{ maxWidth: '26em', textWrap: 'balance' }} textAlign="center" variant="h5">
          {statusCode === 404
            ? 'Sorry, couldn‘t find that page. Email me if something is wrong.'
            : 'Something went super wrong, sorry. Email me to let me know.'}
        </Typography>
        <Link
          buttonProps={{
            color: 'secondary',
          }}
          href="/"
          isButton={true}
          sx={{ marginTop: 3 }}
          title="Home"
        >
          Back home
        </Link>
      </Stack>
    </>
  );
}
