import 'server-only';
import wretch from 'wretch';

export type ClientProps = {
  /**
   * A string starting with https:// that points to the base API endpoint
   */
  endpoint: string;
};

/**
 * Creates a REST client that can be used to fetch resources from a base API.
 */
export function createClient({ endpoint }: ClientProps) {
  return wretch(endpoint).content('application/json');
}
