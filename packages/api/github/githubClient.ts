import { createClient } from 'api-clients/authenticatedGraphQLClient';
import { invariant } from 'shared-core/helpers/invariant';

const ACCESS_TOKEN = process.env.GITHUB_AUTHENTICATION_TOKEN;
invariant(ACCESS_TOKEN, 'Missing GITHUB_AUTHENTICATION_TOKEN env variable');

/**
 * Use this GraphQL client to make requests to Github from the server.
 */
export const githubClient = createClient({
  endpoint: 'https://api.github.com/graphql',
  accessToken: ACCESS_TOKEN,
});
