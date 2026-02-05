import 'server-only';

import { log } from '@dg/shared-core/helpers/log';

/**
 * Recursively parses status from known types
 */
export function getStatus(resp: unknown): number {
  log.info('Getting status', { resp });
  if (!resp) {
    return 500;
  }
  if (typeof resp === 'number') {
    return resp;
  }
  if (typeof resp === 'string') {
    return Number.parseInt(resp, 10);
  }
  if (typeof resp === 'object' && 'status' in resp) {
    return getStatus(resp.status);
  }
  log.info('Could not parse status', { resp });
  return 500;
}
