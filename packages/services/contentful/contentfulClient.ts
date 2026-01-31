import 'server-only';
import { invariant } from '@dg/shared-core/helpers/invariant';
import { createClient } from '../clients/authenticatedGraphQLClient';

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;
invariant(SPACE_ID, 'Missing CONTENTFUL_SPACE_ID env variable');
invariant(ACCESS_TOKEN, 'Missing CONTENTFUL_ACCESS_TOKEN env variable');

/**
 * Use this GraphQL client to make requests to Contentful from the server.
 */
export const contentfulClient = createClient({
  accessToken: ACCESS_TOKEN,
  endpoint: `https://graphql.contentful.com/content/v1/spaces/${SPACE_ID}`,
});
