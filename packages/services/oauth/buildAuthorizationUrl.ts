import 'server-only';

import type { OauthProviderConfig } from './oauthProviderConfig';

/**
 * Parameters needed to build a provider authorization URL.
 */
type AuthorizationUrlParams = {
  callbackUrl: string;
  clientId: string;
  codeChallenge?: string;
  config: OauthProviderConfig;
  state: string;
};

/**
 * Builds the OAuth authorization URL for a provider.
 * Includes PKCE params when provided and merges provider-specific extras.
 */
export const buildAuthorizationUrl = ({
  callbackUrl,
  clientId,
  codeChallenge,
  config,
  state,
}: AuthorizationUrlParams) => {
  const url = new URL(config.authUrl);
  url.searchParams.append('client_id', clientId);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('redirect_uri', callbackUrl);
  url.searchParams.append('state', state);
  url.searchParams.append('scope', config.scopes);

  if (codeChallenge) {
    url.searchParams.append('code_challenge', codeChallenge);
    url.searchParams.append('code_challenge_method', 'S256');
  }

  for (const [key, value] of Object.entries(config.extraParams)) {
    url.searchParams.append(key, value);
  }

  return url.toString();
};
