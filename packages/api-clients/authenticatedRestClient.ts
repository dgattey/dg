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
 * Returns true if we're authed via status code
 */
const isAuthedStatus = <Type>({ status }: FetchResult<Type>) => !(status >= 400 && status < 500);

/**
 * Fetches a resource from a base API, after grabbing a refreshed access
 * token if needed first to use for authentication.
 */
const fetchWithAuth =
  ({ endpoint, accessKey, refreshTokenConfig }: ClientProps) =>
  async <Type>(resource: string): Promise<FetchResult<Type | undefined>> => {
    // Actually fetches, forcing a refreshed key if necessary. Passes Bearer auth and requests JSON
    const runFetch = async (forceRefresh: boolean) => {
      const accessToken = await refreshedAccessToken(accessKey, refreshTokenConfig, forceRefresh);
      return fetch<Type>(`${endpoint}/${resource}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    };

    // Fetch data normally, refreshing the access token if necessary
    const data = await runFetch(false);
    if (isAuthedStatus(data)) {
      return data;
    }

    // We weren't authed but in the process of fetching, we refreshed the token,
    // so try again with that new tokem, and return whatever we have
    return runFetch(true);
  };

/**
 * Creates a REST client that can be used to fetch resources from a base API, with auto-refreshing
 * access tokens built into the fetch function.
 */
export const createClient = (props: ClientProps) => ({
  fetch: fetchWithAuth(props),
});
