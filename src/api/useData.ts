import useSWR from 'swr';
import fetchIntroBlock from './contentful/fetchIntroBlock';
import fetchProjects from './contentful/fetchProjects';
import fetchSiteFooter from './contentful/fetchSiteFooter';
import fetchSiteHeader from './contentful/fetchSiteHeader';
import fetchRepoVersion from './github/fetchRepoVersion';

/**
 * A type of fetcher - all possible values are here
 */
export type FetcherKey = keyof typeof fetchers;

/**
 * The promise value for a fetcher key
 */
type PromisedReturnValue<Key extends FetcherKey> = ReturnType<typeof fetchers[Key]>;

/**
 * Returns a type to use as the `fallback` of a fetcher function.
 */
export type Fallback<Key extends FetcherKey> = {
  [K in Key]: Awaited<PromisedReturnValue<K>>;
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
} as const;

/**
 * Fetches data for a particular key. The type assertion is necessary,
 * otherwise it too broadly types `fetcher` even though we know its
 * type since the object is a literal here.
 */
export const fetchData = <Key extends FetcherKey>(key: Key): PromisedReturnValue<Key> =>
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  fetchers[key]() as PromisedReturnValue<Key>;

/**
 * Exposes a useSWR hook for a particular key
 */
const useData = <Key extends FetcherKey>(key: Key) =>
  useSWR<Awaited<PromisedReturnValue<Key>>, Error>(key, fetchData);

export default useData;
