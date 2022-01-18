import { linkWithName } from 'api/contentful/fetchSiteFooter';
import useData from 'api/useData';
import ErrorLayout from 'components/layouts/ErrorLayout';
import Link from 'components/Link';
import { useRouter } from 'next/router';
import React from 'react';

/**
 * Error page, for 404s
 */
const Error404Page = () => {
  const router = useRouter();
  const { data: footerLinks } = useData('siteFooter');
  const emailLink = linkWithName(footerLinks, 'Email');
  return (
    <ErrorLayout>
      <h1>😢 Oops, couldn&apos;t find that!</h1>
      <p>
        I didn&apos;t see a page matching the url <code>{router.pathname}</code> on the site. Check
        out the homepage and see if you can find what you were looking for. If not,{' '}
        {emailLink ? <Link alwaysShowTitle {...emailLink} /> : 'Email Me'} and I can help you out!
      </p>
    </ErrorLayout>
  );
};

export default Error404Page;
