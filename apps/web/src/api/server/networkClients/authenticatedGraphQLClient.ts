import { GraphQLClient } from 'graphql-request';

/**
 * This can be used to generate an authenticated GraphQLClient for
 * use with a particular endpoint and token. Should only ever be used
 * on the server.
 */
export const authenticatedGraphQLClient = (endpoint: string, accessToken?: string) =>
  new GraphQLClient(endpoint, {
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${accessToken ?? ''}`,
    },
  });
