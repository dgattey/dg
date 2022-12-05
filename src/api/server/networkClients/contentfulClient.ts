import { authenticatedGraphQLClient } from './authenticatedGraphQLClient';

const ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;
const ENDPOINT = `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`;

/**
 * Use this GraphQL client to make requests to Contentful from the server.
 */
export const contentfulClient = authenticatedGraphQLClient(ENDPOINT, ACCESS_TOKEN);
