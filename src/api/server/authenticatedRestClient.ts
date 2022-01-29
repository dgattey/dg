import type { TokenKey } from 'api/types/Token';
import refreshedAccessToken from './refreshedAccessToken';

type FetchResult<Type> = Omit<Response, 'json'> & { json: () => Promise<Type> };

/**
 * Returns true if we're authed via status code
 */
const isAuthedStatus = <Type>({ status }: FetchResult<Type>) => !(status >= 400 && status < 500);

/**
 * Fetches a resource from a base API, after grabbing a refreshed access
 * token if needed first to use for authentication.
 */
const fetchWithAuth =
  (baseApiEndpoint: string, tokenName: TokenKey) =>
  async <Type>(resource: string): Promise<FetchResult<Type | undefined>> => {
    // Actually fetches, forcing a refreshed key if necessary. Passes Bearer auth and requests JSON
    const runFetch = async (forceRefresh: boolean) => {
      const accessToken = await refreshedAccessToken(tokenName, forceRefresh);
      return fetch<Type>(`${baseApiEndpoint}/${resource}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    };

    // Fetch data normally once and if there's an auth error, try again with a new token before failing
    let data = await runFetch(false);
    if (!isAuthedStatus(data)) {
      data = await runFetch(true);
      if (!isAuthedStatus(data)) {
        return data;
      }
    }
    return data;
  };

/**
 * Allows creation of an authed rest client via wrapping a base api endpoint and
 * the token name
 */
const authenticatedRestClient = (baseApiEndpoint: string, tokenName: TokenKey) => ({
  fetch: fetchWithAuth(baseApiEndpoint, tokenName),
});

export default authenticatedRestClient;
