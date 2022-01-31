import authenticatedGraphQLClient from './authenticatedGraphQLClient';

const ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;
const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const BASE_ENDPOINT = 'https://graphql.contentful.com/content/v1/spaces';
const ENDPOINT = `${BASE_ENDPOINT}/${SPACE_ID}`;

/**
 * Use this GraphQL client to make requests to Contentful from the server.
 */
const client = authenticatedGraphQLClient(ENDPOINT, ACCESS_TOKEN);

export default client;
