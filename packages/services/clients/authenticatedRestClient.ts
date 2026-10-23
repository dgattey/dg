import 'server-only';
import { assertHttpsEndpoint } from '@dg/shared-core/assertions/assertHttpsEndpoint';
import { log } from '@dg/shared-core/logging/log';
import type { Wretch } from 'wretch';
import wretch from 'wretch';
import type { RefreshTokenConfig } from './RefreshTokenConfig';
import { refreshedAccessToken } from './refreshedAccessToken';

function getStatus(resp: unknown): number {
  if (typeof resp === 'number') {
    return resp;
  }
  if (resp instanceof Response) {
    return resp.status;
  }
  if (typeof resp === 'object' && resp !== null && 'status' in resp) {
    return getStatus(resp.status);
  }
  return 0;
}

type ClientProps = {
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

const REQUEST_TIMEOUT_MS = 8_000;

export function createClient({ endpoint, accessKey, refreshTokenConfig }: ClientProps) {
  assertHttpsEndpoint(endpoint);
  const api = wretch(endpoint, { cache: 'no-store' }).content('application/json');

  async function addAuth<Self, Chain, Resolver>(
    request: Self & Wretch<Self, Chain, Resolver>,
    forceRefresh: boolean,
  ) {
    const accessToken = await refreshedAccessToken(accessKey, refreshTokenConfig, forceRefresh);
    return request.auth(`Bearer ${accessToken}`);
  }

  /**
   * Spotify (and similar APIs) send `Retry-After` as seconds or an HTTP date.
   * Returns undefined when the header is missing or unparseable.
   *
   * Non-2xx responses arrive as a thrown wretch error rather than a `Response`,
   * so unwrap that too — otherwise the header is invisible for exactly the
   * statuses (429, 503) that send it.
   */
  function readRetryAfterSeconds(input: unknown): number | undefined {
    const resp =
      input instanceof Response
        ? input
        : typeof input === 'object' && input !== null && 'response' in input
          ? (input as { response: unknown }).response
          : undefined;
    if (!(resp instanceof Response)) {
      return undefined;
    }
    const raw = resp.headers.get('retry-after');
    if (!raw) {
      return undefined;
    }
    const asSeconds = Number.parseInt(raw, 10);
    if (!Number.isNaN(asSeconds)) {
      return Math.max(0, asSeconds);
    }
    const asDate = Date.parse(raw);
    if (Number.isNaN(asDate)) {
      return undefined;
    }
    return Math.max(0, Math.ceil((asDate - Date.now()) / 1000));
  }

  /**
   * Fetches a resource from the API, using a refreshed access token if necessary. Returns a
   * Wretch chain that can be used to further process the response based on status code.
   */
  async function getWithAuth(resource: string) {
    const authedApi = (await addAuth(api, false)).options({
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const response = authedApi.get(resource).unauthorized(async (_error, req) => {
      // Renew credentials once and try to fetch again but fail if we hit another unauthorized
      log.info('Unauthorized request, refreshing access token', { resource });
      // The retry needs its own deadline. Reusing the first request's signal
      // spends that budget on the failed attempt plus the token refresh, so a
      // slow refresh aborts the retry before it is even sent.
      const authedReq = (await addAuth(req, true)).options({
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      return authedReq.get(resource).unauthorized((err) => {
        log.error('Failed to refresh access token', { resource });
        throw err;
      });
    });
    const respOrError = await response.res().catch((err: unknown) => err);
    const status = getStatus(respOrError);
    const retryAfterSeconds = readRetryAfterSeconds(respOrError);
    log.info('Fetched', { resource, retryAfterSeconds, status });
    return {
      response,
      retryAfterSeconds,
      status,
    };
  }

  return {
    get: getWithAuth,
  };
}
