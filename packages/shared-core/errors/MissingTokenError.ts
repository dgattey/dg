/**
 * Custom error thrown when an OAuth token is missing or invalid.
 * This allows consumers to catch this specific error and handle it
 * appropriately (e.g., redirecting to OAuth setup in development).
 */
export class MissingTokenError extends Error {
  constructor(public readonly tokenName: string) {
    super(`Missing token: ${tokenName}`);
    this.name = 'MissingTokenError';
  }
}

/**
 * Type guard to check if an error is a MissingTokenError.
 */
export function isMissingTokenError(error: unknown): error is MissingTokenError {
  return error instanceof MissingTokenError;
}
