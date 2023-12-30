import { GraphQLClient } from 'graphql-request';

type ClientProps = {
  /**
   * A string starting with https:// that points to the base API endpoint
   */
  endpoint: string;

  /**
   * A string that is the access token to use for authentication
   */
  accessToken: string;
};

/**
 * This can be used to generate an authenticated GraphQLClient for
 * use with a particular endpoint and token. Should only ever be used
 * on the server.
 */
export const createClient = ({ endpoint, accessToken }: ClientProps) =>
  new GraphQLClient(endpoint, {
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
  });
