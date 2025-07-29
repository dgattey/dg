import useSWR from 'swr';
import wretch from 'wretch';
import type { AwaitedType, EndpointKey, EndpointType } from './endpoints';

const api = wretch('/api/');

/**
 * Uses a well-typed `fetch` to call an API endpoint using the api
 * key given, then grabs the JSON data from it.
 */
const fetchData = async <Key extends EndpointKey>(key: Key): Promise<EndpointType<Key>> => {
  const result = api.get(key);
  return await result.json<EndpointType<Key>>();
};

/**
 * For client use only! Exposes a useSWR hook for fetching data
 * from one endpoint key that maps to an /api endpoint. Only
 * revalidates and refetches if the key starts with `latest`.
 * So other keys like `version` will only be fetched once on build.
 */
export const useData = <Key extends EndpointKey>(key: Key) => {
  const isImmutable = !key.startsWith('latest');
  return useSWR<AwaitedType<Key>, Error>(key, fetchData, {
    revalidateIfStale: !isImmutable,
    revalidateOnFocus: !isImmutable,
    revalidateOnReconnect: !isImmutable,
  });
};
