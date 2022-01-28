import fetchFallback from 'api/fetchFallback';
import { findLinkWithName } from 'api/parsers';
import useData from 'api/useData';
import ErrorLayout from 'components/layouts/ErrorLayout';
import Link from 'components/Link';
import { useRouter } from 'next/router';
import React from 'react';
import { Props } from './_error';

/**
 * If this is on the server, it'll provide a response to use for a status code
 */
export const getStaticProps = async () => {
  const data = await fetchFallback(['version', 'footer', 'header']);
  return {
    props: {
      fallback: {
        ...data,
      },
    },
  };
};

/**
 * Contents of the page in a different element so fallback can work its server-rendered magic
 */
const Contents = () => {
  const router = useRouter();
  const { data: footerLinks } = useData('footer');
  const emailLink = findLinkWithName(footerLinks, 'Email');
  return (
    <>
      <h1>😢 Oops, couldn&apos;t find that!</h1>
      <p>
        I didn&apos;t see a page matching the url <code>{router.asPath}</code> on the site. Check
        out the homepage and see if you can find what you were looking for. If not,{' '}
        {emailLink ? <Link layout="plainIconAndText" {...emailLink} /> : 'Email Me'} and I can help
        you out!
      </p>
    </>
  );
};

/**
 * Error page, for 404s specifically
 */
const Error404Page = ({ fallback }: Props) => (
  <ErrorLayout fallback={fallback}>
    <Contents />
  </ErrorLayout>
);

export default Error404Page;
