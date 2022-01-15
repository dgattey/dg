import useSWR from 'swr';
import fetchIntroBlock from './contentful/fetchIntroBlock';
import fetchMyLocation from './contentful/fetchMyLocation';
import fetchProjects from './contentful/fetchProjects';
import fetchSiteFooter from './contentful/fetchSiteFooter';
import fetchSiteHeader from './contentful/fetchSiteHeader';
import fetchRepoVersion from './github/fetchRepoVersion';

/**
 * A type of fetcher - all possible values are here
 */
export type FetcherKey = keyof typeof fetchers;

/**
 * The type of promise that a fetcher key uses to fetch data
 */
type PromisedReturnValue<Key extends FetcherKey> = ReturnType<typeof fetchers[Key]>;

/**
 * The bare value when we've fetched data for a fetcher key
 */
type ReturnedValue<Key extends FetcherKey> = Awaited<PromisedReturnValue<Key>>;

/**
 * Record of `FetcherKey` to its awaited return type
 */
type ReturnedValueMap<Keys extends FetcherKey> = { [Key in Keys]: ReturnedValue<Key> };

/**
 * Returns a type to use as the `fallback` of a fetcher
 * function - only has some of the keys, not all. Use
 * on pages where you don't need every single fetched item.
 */
export type PartialFallback<Key extends FetcherKey> = {
  [K in Key]: Awaited<PromisedReturnValue<K>>;
};

/**
 * Returns a type to use as the `fallback` of a fetcher function.
 * Fetches absolutely all the data we have defined.
 */
export type Fallback = {
  [Property in keyof typeof fetchers]: Awaited<PromisedReturnValue<Property>>;
};

/**
 * This maps between API/data fetcher keys for use with SWR, and the
 * function invoked to fetch the data. As such, must map from a key to
 * a function that returns data (as a promise).
 */
const fetchers = {
  /**
   * Current version string for the site footer
   */
  version: fetchRepoVersion,

  /**
   * Text and icon links for the site footer
   */
  siteFooter: fetchSiteFooter,

  /**
   * Text links for the full site header
   */
  siteHeader: fetchSiteHeader,

  /**
   * All projects to list on home page
   */
  projects: fetchProjects,

  /**
   * The introduction rich text block for the homepage
   */
  introBlock: fetchIntroBlock,

  /**
   * Dylan's location (approx) for display on a map
   */
  myLocation: fetchMyLocation,
} as const;

/**
 * Fetches data for multiple keys and returns an array of the
 * promised return values.
 */
export const fetchData = async <Keys extends FetcherKey>(
  keys: Array<Keys>,
): Promise<ReturnedValueMap<Keys>> => {
  /**
   * We need this type assertion, otherwise we need to use partials
   * or something else annoying. We know by virtue of having constructed
   * the promises
   */
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const results = {} as ReturnedValueMap<Keys>;
  return Promise.all(keys.map((key) => fetchers[key]())).then((list) =>
    list.reduce((resolvedPromises, value, index) => {
      const key = keys[index];
      if (!key) {
        throw new TypeError('Missing key');
      }
      return { ...resolvedPromises, [key]: value };
    }, results),
  );
};

/**
 * Fetches data for a particular key.
 */
export const fetchDatum = async <Key extends FetcherKey>(
  key: Key,
): Promise<PromisedReturnValue<Key>> => {
  const data = await fetchData([key]);
  return data[key];
};

/**
 * Exposes a useSWR hook for a particular key
 */
const useData = <Key extends FetcherKey>(key: Key) =>
  useSWR<Awaited<PromisedReturnValue<Key>>, Error>(key, fetchDatum);

export default useData;
