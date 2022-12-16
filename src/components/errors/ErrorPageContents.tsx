import { Typography } from '@mui/material';
import { Link } from 'components/Link';
import { useLinkWithName } from 'hooks/useLinkWithName';
import { useRouter } from 'next/router';

export type HasStatusCode = {
  /**
   * What kind of error we encountered
   */
  statusCode?: number;
};

// Error codes to title of page
const TITLE_TEXT: Record<number | 'fallback', string> = {
  404: "😢 Oops, couldn't find that!",
  fallback: '😬 This is awkward...',
};

/**
 * Contents of the page in a different element so fallback can work its server-rendered magic
 */
export function ErrorPageContents({ statusCode }: HasStatusCode) {
  const router = useRouter();
  const emailLink = useLinkWithName('Email');
  const descriptions: Record<number | 'fallback', JSX.Element> = {
    404: (
      <>
        I didn&apos;t see a page matching the url{' '}
        <Typography variant="code" component="code">
          {router.asPath}
        </Typography>{' '}
        on the site. Check out the homepage and see if you can find what you were looking for. If
        not,
      </>
    ),
    fallback: (
      <>
        Looks like I encountered a serverside error, otherwise known as a dreaded{' '}
        {statusCode ?? 500}. Sorry! Try refreshing the page or attempting your action again. If
        it&apos;s still broken,
      </>
    ),
  };
  return (
    <>
      <Typography variant="h1">
        {(statusCode && TITLE_TEXT[statusCode]) || TITLE_TEXT.fallback}
      </Typography>
      <Typography variant="body1" sx={{ maxWidth: '35em' }}>
        {(statusCode && descriptions[statusCode]) || descriptions.fallback}{' '}
        {emailLink ? <Link layout="iconText" {...emailLink} href={emailLink.url} /> : 'Email Me'}{' '}
        and I can help you out!
      </Typography>
    </>
  );
}
