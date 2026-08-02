/**
 * Supported OAuth providers.
 */
export type OauthProviderKey = 'strava' | 'spotify';

/**
 * Shared API route path constants.
 */
export const oauthRoute = '/api/oauth' as const;
export const webhooksRoute = '/api/webhooks' as const;

/** Starts Sign in with Vercel (PKCE authorize redirect). */
export const vercelAuthRoute = '/api/auth/vercel' as const;
export const vercelAuthCallbackRoute = '/api/auth/vercel/callback' as const;
export const vercelAuthLogoutRoute = '/api/auth/vercel/logout' as const;

export const oauthConnectRoute = (provider: OauthProviderKey) =>
  `${oauthRoute}?provider=${provider}`;
