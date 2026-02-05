/**
 * Validates that an endpoint URL uses HTTPS to prevent token/data exposure.
 * @throws Error if the endpoint doesn't start with https://
 */
export function assertHttpsEndpoint(endpoint: string): void {
  if (!endpoint.startsWith('https://')) {
    throw new Error(`Endpoint must use HTTPS: ${endpoint}`);
  }
}
