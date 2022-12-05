import type { GetServerSidePropsContext } from 'next';

/**
 * Used to grab the page url from serverside props using host/resolved url
 */
export const getPageUrl = (context: GetServerSidePropsContext) => {
  const { host } = context.req.headers;
  if (!context.req.headers.host) {
    throw TypeError('No host to use as URL');
  }
  return `${host}${context.resolvedUrl}`;
};
