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
 * from one endpoint key that maps to an /api endpoint.
 */
export const useData = <Key extends EndpointKey>(key: Key) =>
  useSWR<AwaitedType<Key>, Error>(key, fetchData);
