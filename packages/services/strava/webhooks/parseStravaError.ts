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
  } catch {
    // Body isn't JSON, use raw
  }

  // Check for specific error codes from Strava
  const firstError = parsed?.errors?.[0];

  // The Strava app itself is switched off, so every API call fails until it's
  // reactivated at https://www.strava.com/settings/api
  if (firstError?.resource === 'Application' && firstError.code === 'Inactive') {
    return 'The Strava application is inactive. Reactivate it in your Strava API settings to manage webhooks.';
  }

  // "already exists" is a specific error code from Strava
  if (firstError?.code === 'already exists') {
    return 'A webhook subscription already exists for this app. Delete the existing subscription first.';
  }

  // Callback URL verification failed - Strava couldn't reach the URL
  if (firstError?.code === 'GET to callback URL does not return 200') {
    return `Strava could not reach the callback URL (${callbackUrl}). Make sure the Cloudflare tunnel is running (check for cloudflared in turbo dev output).`;
  }

  if (status === 401 || status === 403) {
    return 'Invalid Strava client credentials. Check STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET.';
  }

  if (status === 400) {
    // 400 can mean various things - include Strava's actual error details
    const details = firstError?.code ?? parsed?.message ?? body;
    return `Strava rejected the request: ${details}`;
  }

  // Fallback to Strava's message or generic error
  if (parsed?.message) {
    return `Strava error: ${parsed.message}`;
  }

  return `Strava returned ${status}: ${body || 'Unknown error'}`;
}
