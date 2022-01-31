import authenticatedGraphQLClient from './authenticatedGraphQLClient';

const ACCESS_TOKEN = process.env.GITHUB_AUTHENTICATION_TOKEN;
const ENDPOINT = 'https://api.github.com/graphql';

/**
 * Use this GraphQL client to make requests to Github from the server.
 */
const client = authenticatedGraphQLClient(ENDPOINT, ACCESS_TOKEN);

export default client;
