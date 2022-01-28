import fetchContentfulFooterLinks from './server/fetchContentfulFooterLinks';
import fetchContentfulHeaderLinks from './server/fetchContentfulHeaderLinks';
import fetchContentfulIntroBlock from './server/fetchContentfulIntroBlock';
import fetchContentfulLocation from './server/fetchContentfulLocation';
import fetchContentfulProjects from './server/fetchContentfulProjects';
import fetchGithubRepoVersion from './server/fetchGithubRepoVersion';
import fetchSpotifyCurrentlyPlaying from './server/fetchSpotifyCurrentlyOrRecentlyPlayed';

/**
 * All possible types of endpoints we could request
 */
export type EndpointKey = keyof typeof endpoints;

/**
 * Returns the endpoint's return type given a generic `EndpointKey`
 */
export type EndpointType<Key extends EndpointKey> = ReturnType<typeof endpoints[Key]>;

/**
 * Convenience type for the awaited version of the endpoint's return type
 */
export type AwaitedType<Key extends EndpointKey> = Awaited<EndpointType<Key>>;

/**
 * These represent all possible endpoints our server can handle/call. To add
 * a new one, add an import for the fetcher and add a short key to identify it.
 * The keys can have slashes, representing sub paths. Use this ONLY from the
 * server or `getStaticProps`, NOT from the client!
 */
const endpoints = {
  // Intro block of content via Contentful
  intro: fetchContentfulIntroBlock,

  // My current location via Contentful
  location: fetchContentfulLocation,

  // All projects via Contentful
  projects: fetchContentfulProjects,

  // Footer links via Contentful
  footer: fetchContentfulFooterLinks,

  // Header data via Contentful
  header: fetchContentfulHeaderLinks,

  // App version via Github
  version: fetchGithubRepoVersion,

  // Last played song via Spotify
  'current/playing': fetchSpotifyCurrentlyPlaying,
} as const;

/**
 * Typeguard for narrowing a possible key into a well typed endpoint key
 */
export const isValid = (possibleKey: string | undefined): possibleKey is EndpointKey =>
  typeof possibleKey === 'string' && Object.keys(endpoints).includes(possibleKey);

export default endpoints;