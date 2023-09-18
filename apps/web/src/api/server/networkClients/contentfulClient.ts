import { authenticatedGraphQLClient } from './authenticatedGraphQLClient';

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;

if (!SPACE_ID || !ACCESS_TOKEN) {
  throw new Error('Missing contentfulClient env variable');
}

const ENDPOINT = `https://graphql.contentful.com/content/v1/spaces/${SPACE_ID}`;

/**
 * Use this GraphQL client to make requests to Contentful from the server.
 */
export const contentfulClient = authenticatedGraphQLClient(ENDPOINT, ACCESS_TOKEN);
