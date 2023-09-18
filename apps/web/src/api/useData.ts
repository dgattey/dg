import useSWR from 'swr';
import type { AwaitedType, EndpointKey, EndpointType } from './endpoints';

/**
 * Uses a well-typed `fetch` to call an API endpoint using the api
 * key given, then grabs the JSON data from it.
 */
const fetchData = async <Key extends EndpointKey>(key: Key): Promise<EndpointType<Key>> => {
  const result = await fetch<EndpointType<Key>>(`/api/${key}`);
  return result.json();
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
