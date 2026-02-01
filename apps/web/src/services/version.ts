import 'server-only';

import { version } from '../../../../package.json';

export const getAppVersion = () => {
  return `v${version}`;
};
