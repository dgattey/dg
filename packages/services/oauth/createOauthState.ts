import 'server-only';

import { generateCodeChallenge, generateCodeVerifier, generateSecureState } from './oauthSecurity';

/**
 * Values stored with a generated OAuth state.
 */
export type OauthStatePayload = {
  state: string;
  codeVerifier?: string;
  codeChallenge?: string;
};

/**
 * Creates a secure state value and optional PKCE data for a provider.
 */
export const createOauthState = (supportsPkce: boolean): OauthStatePayload => {
  const state = generateSecureState();
  const codeVerifier = supportsPkce ? generateCodeVerifier() : undefined;
  const codeChallenge = codeVerifier ? generateCodeChallenge(codeVerifier) : undefined;

  return { codeChallenge, codeVerifier, state };
};
