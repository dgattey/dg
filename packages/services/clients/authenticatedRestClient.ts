import 'server-only';
import { assertHttpsEndpoint } from '@dg/shared-core/assertions/assertHttpsEndpoint';
import { log } from '@dg/shared-core/logging/log';
import type { Wretch } from 'wretch';
import wretch from 'wretch';
import { getStatus } from './getStatus';
import type { RefreshTokenConfig } from './RefreshTokenConfig';
import { refreshedAccessToken } from './refreshedAccessToken';

export type ClientProps = {
  /**
   * The name of this client, used to store access tokens in the database
   */
  accessKey: string;

  /**
   * A string starting with https:// that points to the base API endpoint
   */
  endpoint: string;

  /**
   * A configuration object for fetching + validating the refresh token
   */
  refreshTokenConfig: RefreshTokenConfig;
};

/**
 * Creates a REST client that can be used to fetch resources from a base API, with auto-refreshing
 * access tokens built into the fetch function.
 */
export function createClient({ endpoint, accessKey, refreshTokenConfig }: ClientProps) {
  assertHttpsEndpoint(endpoint);
  const api = wretch(endpoint).content('application/json');

  /**
   * Generates an auth header with a refreshed access token
   */
  async function addAuth<Self, Chain, Resolver>(
    request: Self & Wretch<Self, Chain, Resolver>,
    forceRefresh: boolean,
  ) {
    const accessToken = await refreshedAccessToken(accessKey, refreshTokenConfig, forceRefresh);
    return request.auth(`Bearer ${accessToken}`);
  }

  /**
   * Fetches a resource from the API, using a refreshed access token if necessary. Returns a
   * Wretch chain that can be used to further process the response based on status code.
   */
  async function getWithAuth(resource: string) {
    const authedApi = await addAuth(api, false);
    const response = authedApi.get(resource).unauthorized(async (_error, req) => {
      // Renew credentials once and try to fetch again but fail if we hit another unauthorized
      log.info('Unauthorized request, refreshing access token', { resource });
      const authedReq = await addAuth(req, true);
      return authedReq.get(resource).unauthorized((err) => {
        log.error('Failed to refresh access token', { resource });
        throw err;
      });
    });
    const respOrError = await response.res().catch((err: unknown) => err);
    const status = getStatus(respOrError);
    log.info('Fetched', { resource, status });
    return {
      response,
      status,
    };
  }

  return {
    get: getWithAuth,
  };
}
