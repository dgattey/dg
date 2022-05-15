import type { EndpointKey } from 'api/endpoints';
import type { PartialFallback } from 'api/fetchFallback';

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
