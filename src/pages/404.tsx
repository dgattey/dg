import fetchFallback from 'api/fetchFallback';
import ErrorLayout from 'components/layouts/ErrorLayout';
import React from 'react';
import { Contents, Props } from './_error';

/**
 * If this is on the server, it'll provide a response to use for a status code
 */
export const getStaticProps = async () => {
  const data = await fetchFallback(['version', 'footer']);
  return {
    props: {
      fallback: {
        ...data,
      },
    },
  };
};

/**
 * Error page, for 404s specifically
 */
const Error404Page = ({ fallback }: Props) => (
  <ErrorLayout fallback={fallback} statusCode={404}>
    <Contents statusCode={404} />
  </ErrorLayout>
);

export default Error404Page;
