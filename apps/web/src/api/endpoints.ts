import { fetchFooterLinks } from 'api/contentful/fetchFooterLinks';
import { fetchIntroContent } from 'api/contentful/fetchIntroContent';
import { fetchCurrentLocation } from 'api/contentful/fetchCurrentLocation';
import { fetchPrivacyContent } from 'api/contentful/fetchPrivacyContent';
import { fetchProjects } from 'api/contentful/fetchProjects';
import { fetchRepoVersion } from 'api/github/fetchRepoVersion';
import { fetchRecentlyPlayed } from 'api/spotify/fetchRecentlyPlayed';
import { fetchLatestStravaActivityFromDb } from 'api/strava/fetchLatestStravaActivityFromDb';

/**
 * All possible types of endpoints we could request
 */
export type EndpointKey = keyof typeof endpoints;

/**
 * Returns the endpoint's return type given a generic `EndpointKey`
 */
export type EndpointType<Key extends EndpointKey> = ReturnType<(typeof endpoints)[Key]>;

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
export const endpoints = {
  // Intro block of content via Contentful
  intro: fetchIntroContent,

  // Privacy block of content via Contentful
  privacy: fetchPrivacyContent,

  // My current location via Contentful
  location: fetchCurrentLocation,

  // All projects via Contentful
  projects: fetchProjects,

  // Footer links via Contentful
  footer: fetchFooterLinks,

  // App version via Github
  version: fetchRepoVersion,

  // Last played song via Spotify
  'latest/song': fetchRecentlyPlayed,

  // Fetches the latest Strava activity I've done
  'latest/activity': fetchLatestStravaActivityFromDb,
} as const;

/**
 * Typeguard for narrowing a possible key into a well typed endpoint key
 */
export const isValid = (possibleKey: string | undefined): possibleKey is EndpointKey =>
  typeof possibleKey === 'string' && Object.keys(endpoints).includes(possibleKey);
