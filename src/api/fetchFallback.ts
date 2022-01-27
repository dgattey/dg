import type { AwaitedType, EndpointKey } from './endpoints';
import endpoints from './endpoints';

/**
 * Returns a type to use as fallback data - this only has some of the fields
 * defined, and should be used in contexts where you want to fetch only some
 * of the data like error pages.
 */
export type PartialFallback<Key extends EndpointKey> = {
  [K in Key]: AwaitedType<K>;
};

/**
 * Returns a type to use as fallback data - and describes fetching every
 * piece of data. The main page will use this, as will some other pages.
 */
export type Fallback = {
  [Key in EndpointKey]: AwaitedType<Key>;
};

/**
 * Describes all the data that error pages need to render
 */
export type ErrorPageFallback = PartialFallback<'version' | 'footer' | 'header'>;

/**
 * Fetches all fallback data specified by the array of endpoint keys.
 * IMPORTANT: can't be used from client, needs to be called from
 * `getStaticProps` or equivalent only, in order to create a fallback
 * object for a specific page.
 */
const fetchFallback = async <Key extends EndpointKey>(keys: Array<Key>) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const results = {} as { [ResultKey in Key]: AwaitedType<ResultKey> };
  const promisedData = await Promise.all(keys.map((key) => endpoints[key]()));
  return promisedData.reduce((resolvedPromises, value, index) => {
    const key = keys[index];
    if (!key) {
      throw new TypeError('Missing key');
    }
    return { ...resolvedPromises, [key]: value };
  }, results);
};

export default fetchFallback;
