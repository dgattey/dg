import fetchGithubRepoVersion from '../src/api/server/fetchGithubRepoVersion';

/**
 * Asynchronously fetches the version of the repo from Github using the
 * right data, then writes it to STDOUT for later use.
 */
const getVersion = async () => {
  const version = (await fetchGithubRepoVersion()) ?? 'LOCAL';
  process.stdout.write(version);
};

(() => getVersion())();
