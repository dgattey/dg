import { createHmac, timingSafeEqual } from 'node:crypto';

/** HttpOnly session cookie used for Flags `identify` entity attributes. */
export const VERCEL_SESSION_COOKIE = 'vercel_flags_session';

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export type VercelSessionUser = {
  id: string;
  email: string;
  name?: string;
};

export type FlagEntities = {
  user?: { id: string; email: string };
};

function getSigningSecret(): string | undefined {
  return process.env.VERCEL_APP_CLIENT_SECRET;
}

/**
 * Signs a session payload as `base64url(json).base64url(hmac-sha256)`.
 * Returns null when `VERCEL_APP_CLIENT_SECRET` is not configured.
 */
export function signSession(user: VercelSessionUser): string | null {
  const secret = getSigningSecret();
  if (!secret) {
    return null;
  }

  const payload = Buffer.from(JSON.stringify(user), 'utf8').toString('base64url');
  const signature = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

/**
 * Verifies and parses a signed Vercel session cookie value.
 * Returns null when missing, unsigned, tampered, or secret is unset.
 */
export function parseVercelSessionCookie(value: string | undefined): VercelSessionUser | null {
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

  try {
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const user = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    ) as VercelSessionUser;
    if (typeof user.id !== 'string' || typeof user.email !== 'string' || !user.id || !user.email) {
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

/** Maps a session cookie into Flags evaluation entities. */
export function entitiesFromSessionCookie(cookieValue: string | undefined): FlagEntities {
  const user = parseVercelSessionCookie(cookieValue);
  if (!user) {
    return {};
  }
  return { user: { email: user.email, id: user.id } };
}
