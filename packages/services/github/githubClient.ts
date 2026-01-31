import 'server-only';
import { invariant } from '@dg/shared-core/helpers/invariant';
import { createClient } from '../clients/authenticatedGraphQLClient';

const ACCESS_TOKEN = process.env.GITHUB_AUTHENTICATION_TOKEN;
invariant(ACCESS_TOKEN, 'Missing GITHUB_AUTHENTICATION_TOKEN env variable');

/**
 * Use this GraphQL client to make requests to Github from the server.
 */
export const githubClient = createClient({
  accessToken: ACCESS_TOKEN,
  endpoint: 'https://api.github.com/graphql',
});
