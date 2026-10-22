import 'server-only';

import { invariant } from '@dg/shared-core/assertions/invariant';
import { repository, version } from '../../../../package.json';

const getRepositoryUrl = () => {
  invariant(repository, 'Repository URL missing in package.json');
  return repository.replace(/\.git$/, '');
};

const getAppVersion = () => {
  const resolved = process.env.NEXT_PUBLIC_APP_VERSION?.trim() || version;
  invariant(resolved, 'App version missing in package.json');
  return resolved.startsWith('v') ? resolved : `v${resolved}`;
};

export const getAppVersionInfo = () => {
  const appVersion = getAppVersion();
  return {
    releaseUrl: `${getRepositoryUrl()}/releases/tag/${appVersion}`,
    version: appVersion,
  };
};
