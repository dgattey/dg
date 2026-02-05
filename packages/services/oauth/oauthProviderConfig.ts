import 'server-only';

import type { OauthProviderKey } from '@dg/shared-core/routes/api';

export type OauthProviderConfig = {
  authUrl: string;
  clientIdEnv: string;
  extraParams: Record<string, string>;
  scopes: string;
  supportsPkce: boolean;
};

const PROVIDER_CONFIGS: Record<OauthProviderKey, OauthProviderConfig> = {
  spotify: {
    authUrl: 'https://accounts.spotify.com/authorize',
    clientIdEnv: 'SPOTIFY_CLIENT_ID',
    extraParams: { show_dialog: 'true' },
    scopes: 'user-read-recently-played user-read-currently-playing user-read-playback-state',
    supportsPkce: true,
  },
  strava: {
    authUrl: 'https://www.strava.com/oauth/authorize',
    clientIdEnv: 'STRAVA_CLIENT_ID',
    extraParams: { approval_prompt: 'force', grant_type: 'authorization_code' },
    scopes: 'read,activity:read_all,profile:read_all,read_all',
    supportsPkce: false,
  },
};

export const isValidProvider = (provider: string): provider is OauthProviderKey =>
  Object.hasOwn(PROVIDER_CONFIGS, provider);

export const getProviderConfig = (provider: OauthProviderKey): OauthProviderConfig =>
  PROVIDER_CONFIGS[provider];
