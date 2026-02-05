/**
 * Supported OAuth providers.
 */
export type OauthProviderKey = 'strava' | 'spotify';

/**
 * Shared API route path constants.
 */
export const oauthRoute = '/api/oauth' as const;
export const webhooksRoute = '/api/webhooks' as const;

export const oauthConnectRoute = (provider: OauthProviderKey) =>
  `${oauthRoute}?provider=${provider}`;
