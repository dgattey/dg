import 'server-only';

import { createHash, randomBytes } from 'node:crypto';

/**
 * Generates a cryptographically secure random state token.
 * This prevents CSRF attacks by ensuring the OAuth callback
 * originated from a request we initiated.
 */
export function generateSecureState(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Generates a PKCE code verifier (43-128 character random string).
 * Used to prevent authorization code interception attacks.
 */
export function generateCodeVerifier(): string {
  // 32 bytes = 43 base64url characters
  return randomBytes(32).toString('base64url');
}

/**
 * Generates a PKCE code challenge from a code verifier using S256 method.
 * challenge = BASE64URL(SHA256(verifier))
 */
export function generateCodeChallenge(codeVerifier: string): string {
  return createHash('sha256').update(codeVerifier).digest('base64url');
}
