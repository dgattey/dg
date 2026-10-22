import 'server-only';
import { assertHttpsEndpoint } from '@dg/shared-core/assertions/assertHttpsEndpoint';
import { invariant } from '@dg/shared-core/assertions/invariant';
import { GraphQLClient } from 'graphql-request';

let _contentfulClient: GraphQLClient | undefined;

/**
 * Returns the GraphQL client for Contentful requests.
 * Lazily initialized so importing this module doesn't require env vars at load time.
 */
export function getContentfulClient() {
  if (!_contentfulClient) {
    const spaceId = process.env.CONTENTFUL_SPACE_ID;
    const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
    invariant(spaceId, 'Missing CONTENTFUL_SPACE_ID env variable');
    invariant(accessToken, 'Missing CONTENTFUL_ACCESS_TOKEN env variable');

    const endpoint = `https://graphql.contentful.com/content/v1/spaces/${spaceId}`;
    assertHttpsEndpoint(endpoint);
    _contentfulClient = new GraphQLClient(endpoint, {
      cache: 'no-store',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
    });
  }
  return _contentfulClient;
}
