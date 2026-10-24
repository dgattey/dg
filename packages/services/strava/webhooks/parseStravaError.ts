type StravaErrorResponse = {
  errors?: Array<{
    code?: string;
    field?: string;
    resource?: string;
  }>;
  message?: string;
};

/**
 * Turns a Strava error response into a message worth showing a human.
 * `callbackUrl` is only used by the subscription-creation path, where a
 * failure usually means Strava could not reach the tunnel.
 */
export function parseStravaError(status: number, body: string, callbackUrl?: string): string {
  let parsed: StravaErrorResponse | null = null;
  try {
    parsed = JSON.parse(body) as StravaErrorResponse;
  } catch {}

  const firstError = parsed?.errors?.[0];

  if (firstError?.resource === 'Application' && firstError.code === 'Inactive') {
    return 'The Strava application is inactive. Reactivate it in your Strava API settings to manage webhooks.';
  }

  if (firstError?.code === 'already exists') {
    return 'A webhook subscription already exists for this app. Delete the existing subscription first.';
  }

  if (firstError?.code === 'GET to callback URL does not return 200') {
    return `Strava could not reach the callback URL (${callbackUrl}). Make sure the Cloudflare tunnel is running (run turbo tunnel).`;
  }

  if (status === 401 || status === 403) {
    return 'Invalid Strava client credentials. Check STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET.';
  }

  if (status === 400) {
    const details = firstError?.code ?? parsed?.message ?? body;
    return `Strava rejected the request: ${details}`;
  }

  if (parsed?.message) {
    return `Strava error: ${parsed.message}`;
  }

  return `Strava returned ${status}: ${body || 'Unknown error'}`;
}
