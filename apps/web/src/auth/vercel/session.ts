import { createHmac } from 'node:crypto';
import { timingSafeEqualStrings } from '@dg/services/auth/devConsoleBasicAuth';

/** HttpOnly session cookie authenticating the site owner on `/dev-console`. */
export const VERCEL_SESSION_COOKIE = 'vercel_session';

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

const OWNER_VERCEL_USER_ID = 'Zd6kYbHOXbM1fi2NHCmuSSDP';
const OWNER_VERCEL_USERNAME = 'dgattey';
const OWNER_VERCEL_EMAILS: ReadonlySet<string> = new Set([
  'dylan.gattey@gmail.com',
  'dylan@gattey.com',
  'hi@dylangattey.com',
]);

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

/**
 * Returns true when the Vercel OAuth identity belongs to the site owner (Dylan).
 */
export function isAuthorizedVercelUser(user: {
  email?: string | null;
  id?: string | null;
  username?: string | null;
}): boolean {
  if (user.id === OWNER_VERCEL_USER_ID) {
    return true;
  }
  if (user.username && user.username.toLowerCase() === OWNER_VERCEL_USERNAME) {
    return true;
  }
  if (user.email && OWNER_VERCEL_EMAILS.has(user.email.toLowerCase())) {
    return true;
  }
  return false;
}

/**
 * Signs a session payload as `base64url(json).base64url(hmac-sha256)`.
 * Returns null when `VERCEL_APP_CLIENT_SECRET` is not configured or the user is not authorized.
 */
export function signSession(user: VercelSessionUser, nowMs: number = Date.now()): string | null {
  const secret = getSigningSecret();
  if (!secret || !isAuthorizedVercelUser(user)) {
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
 * Returns null when missing, unsigned, tampered, expired, unauthorized, or secret is unset.
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
      user.exp <= nowMs ||
      !isAuthorizedVercelUser(user)
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
