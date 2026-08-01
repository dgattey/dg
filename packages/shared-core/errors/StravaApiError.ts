/**
 * Thrown when the Strava API answers a request with a non-success status.
 * Carries the status plus a message safe to show a human, so callers can
 * render the failure as a state instead of letting it escape as a crash.
 */
export class StravaApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'StravaApiError';
  }
}

/**
 * Type guard to check if an error is a StravaApiError.
 */
export function isStravaApiError(error: unknown): error is StravaApiError {
  return error instanceof StravaApiError;
}
