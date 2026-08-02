export const VERCEL_OAUTH_STATE_COOKIE = 'vercel_oauth_state';
export const VERCEL_OAUTH_NONCE_COOKIE = 'vercel_oauth_nonce';
export const VERCEL_OAUTH_CODE_VERIFIER_COOKIE = 'vercel_oauth_code_verifier';

export const VERCEL_AUTHORIZE_URL = 'https://vercel.com/oauth/authorize';
export const VERCEL_TOKEN_URL = 'https://api.vercel.com/login/oauth/token';
export const VERCEL_USERINFO_URL = 'https://api.vercel.com/login/oauth/userinfo';

/** OpenID scopes for identity claims only (no refresh tokens). */
export const VERCEL_OAUTH_SCOPES = 'openid email profile';
