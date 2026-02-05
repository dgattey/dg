import 'server-only';
import { invariant } from '@dg/shared-core/assertions/invariant';
import { createClient } from '../clients/authenticatedGraphQLClient';

let _contentfulClient: ReturnType<typeof createClient> | undefined;

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

    _contentfulClient = createClient({
      accessToken,
      endpoint: `https://graphql.contentful.com/content/v1/spaces/${spaceId}`,
    });
  }
  return _contentfulClient;
}
