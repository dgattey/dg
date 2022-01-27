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
 * The keys can have slashes, representing sub paths.
 *
 * IMPORTANT: every one of these should be dynamic imports as this file is used
 * on both the server and client sides and needs to be safe for both. Unfortunately
 * that means that you have to await the import and then call the default function,
 * but it keeps the API elsewhere clean.
 */
const endpoints = {
  // Intro block of content via Contentful
  intro: async () => (await import('./server/fetchContentfulIntroBlock')).default(),

  // My current location via Contentful
  location: async () => (await import('./server/fetchContentfulLocation')).default(),

  // All projects via Contentful
  projects: async () => (await import('./server/fetchContentfulProjects')).default(),

  // Footer links via Contentful
  footer: async () => (await import('./server/fetchContentfulFooterLinks')).default(),

  // Header data via Contentful
  header: async () => (await import('./server/fetchContentfulHeaderLinks')).default(),

  // App version via Github
  version: async () => (await import('./server/fetchGithubRepoVersion')).default(),
} as const;

/**
 * Typeguard for narrowing a possible key into a well typed endpoint key
 */
export const isValid = (possibleKey: string | undefined): possibleKey is EndpointKey =>
  typeof possibleKey === 'string' && Object.keys(endpoints).includes(possibleKey);

export default endpoints;
