import type { EndpointKey } from '@dg/api/endpoints';
import type { PartialFallback } from '@dg/api/fetchFallback';

/**
 * Types a Page itself (in pages directory)
 */
export type Page<Key extends EndpointKey = 'version'> = {
  /**
   * Provides SWR with fallback version data
   */
  fallback: PartialFallback<Key>;

  /**
   * Full page url for use in Meta
   */
  pageUrl: string;
};
