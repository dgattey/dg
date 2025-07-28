import type { AwaitedType, EndpointKey } from './endpoints';
import { endpoints } from './endpoints';

export type FetchedFallbackData<Keys extends EndpointKey> = {
  [Key in Keys]: AwaitedType<Key>;
};

/**
 * Fetches all fallback data specified by the array of endpoint keys.
 * IMPORTANT: can't be used from client, needs to be called from
 * `getStaticProps` or equivalent only, in order to create a fallback
 * object for a specific page.
 */
export const fetchFallbackData = async <Key extends EndpointKey>(keys: Array<Key>) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const results = {} as { [ResultKey in Key]: AwaitedType<ResultKey> };
  const promisedData = await Promise.all(keys.map((key) => endpoints[key]()));
  const fallback = promisedData.reduce((resolvedPromises, value, index) => {
    const key = keys[index];
    if (!key) {
      throw new TypeError('Missing key');
    }
    return { ...resolvedPromises, [key]: value };
  }, results);

  return {
    props: {
      fallback,
    },
  };
};
