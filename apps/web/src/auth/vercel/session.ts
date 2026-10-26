import { createHash, createHmac } from 'node:crypto';
import { timingSafeEqualStrings } from '@dg/services/auth/devConsoleBasicAuth';

/** HttpOnly session cookie authenticating the site owner on `/dev-console`. */
export const VERCEL_SESSION_COOKIE = 'vercel_session';

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

const OWNER_VERCEL_USERNAME = 'dgattey';
const OWNER_VERCEL_USER_ID_SHA256 =
  'b987ca62dc2823f50930e5932b58086b38e9645606029632e1a6232344e8b05a';

export type VercelSessionUser = {
  id: string;
  email: string;
  name?: string;
};

type SignedSessionPayload = VercelSessionUser & {
  exp?: number;
};

function getSigningSecret(): string | undefined {
  return process.env.VERCEL_APP_CLIENT_SECRET;
}

function sha256Hex(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

/**
 * Returns true when the Vercel OAuth identity belongs to the site owner,
 * matched by public handle (`dgattey`) or the SHA-256 digest of the owner's
 * Vercel user ID so raw personal identifiers never live in source control.
 */
export function isAuthorizedVercelUser(user: {
  id?: string | null;
  username?: string | null;
}): boolean {
  if (user.username && user.username.toLowerCase() === OWNER_VERCEL_USERNAME) {
    return true;
  }
  if (user.id && timingSafeEqualStrings(sha256Hex(user.id), OWNER_VERCEL_USER_ID_SHA256)) {
    return true;
  }
  return false;
}

/**
 * Signs a session payload as `base64url(json).base64url(hmac-sha256)`.
 * Returns null when `VERCEL_APP_CLIENT_SECRET` is not configured.
 */
export function signSession(user: VercelSessionUser, nowMs: number = Date.now()): string | null {
  const secret = getSigningSecret();
  if (!secret) {
    return null;
  }

  const payload = Buffer.from(
    JSON.stringify({
      ...user,
      exp: nowMs + SESSION_MAX_AGE_SECONDS * 1000,
    }),
    'utf8',
  ).toString('base64url');
  const signature = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

/**
 * Verifies and parses a signed Vercel session cookie value.
 * Returns null when missing, unsigned, tampered, expired, or secret is unset.
 */
export function parseVercelSessionCookie(
  value: string | undefined,
  nowMs: number = Date.now(),
): VercelSessionUser | null {
  if (!value) {
    return null;
  }

  const secret = getSigningSecret();
  if (!secret) {
    return null;
  }

  const separator = value.indexOf('.');
  if (separator <= 0 || separator === value.length - 1) {
    return null;
  }

  const payload = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  const expected = createHmac('sha256', secret).update(payload).digest('base64url');

  if (!timingSafeEqualStrings(signature, expected)) {
    return null;
  }

  try {
    const user = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    ) as SignedSessionPayload;
    if (
      typeof user.id !== 'string' ||
      typeof user.email !== 'string' ||
      !user.id ||
      !user.email ||
      typeof user.exp !== 'number' ||
      user.exp <= nowMs
    ) {
      return null;
    }
    return {
      email: user.email,
      id: user.id,
      ...(typeof user.name === 'string' && user.name ? { name: user.name } : {}),
    };
  } catch {
    return null;
  }
}

/**
 * Returns true when the request is allowed to access `/dev-console` tools and actions.
 * Production requires a valid signed Vercel session cookie for the site owner;
 * non-production environments allow access without a cookie for local development.
 */
export function isDevConsoleAccessAllowed(
  sessionCookieValue: string | undefined,
  nowMs: number = Date.now(),
): boolean {
  if (parseVercelSessionCookie(sessionCookieValue, nowMs) !== null) {
    return true;
  }
  return process.env.NODE_ENV !== 'production';
}
