import nextBuildId from 'next-build-id';

/**
 * Grabs version from filesystem - must be used in SSG, not SSR.
 */
const fetchVersion = async () => {
  try {
    return await nextBuildId({ dir: __dirname, describe: true });
  } catch {
    // This will happen in the client, so just fall back to the other value
    return undefined;
  }
};

export default fetchVersion;
