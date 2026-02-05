import 'server-only';

import { invariant } from '@dg/shared-core/assertions/invariant';
import { repository, version } from '../../../../package.json';

const getRepositoryUrl = () => {
  invariant(repository, 'Repository URL missing in package.json');
  return repository.replace(/\.git$/, '');
};

export const getAppVersion = () => {
  invariant(version, 'App version missing in package.json');
  return `v${version}`;
};

export const getAppVersionInfo = () => {
  const appVersion = getAppVersion();
  return {
    releaseUrl: `${getRepositoryUrl()}/releases/tag/${appVersion}`,
    version: appVersion,
  };
};
