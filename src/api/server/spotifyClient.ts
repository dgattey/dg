import refreshedAccessToken from './refreshedAccessToken';

type FetchResult<Type> = Omit<Response, 'json'> & { json: () => Promise<Type> };

// This is Spotify's base API endpoint
const BASE_ENDPOINT = 'https://api.spotify.com/v1';

/**
 * Returns true if we're authed via status code
 */
const isAuthedStatus = <Type>({ status }: FetchResult<Type>) => !(status >= 400 && status < 500);

/**
 * Fetches a resource from Spotify's base API, after grabbing a refreshed
 * access token first to use for authentication.
 */
const spotifyFetch = async <Type>(resource: string): Promise<FetchResult<Type | undefined>> => {
  const runFetch = async (forceRefresh: boolean) => {
    const accessToken = await refreshedAccessToken('spotify', forceRefresh);
    return fetch<Type>(`${BASE_ENDPOINT}/${resource}`, {
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
 * Just exposes the fetch function
 */
const spotifyClient = {
  fetch: spotifyFetch,
};

export default spotifyClient;
