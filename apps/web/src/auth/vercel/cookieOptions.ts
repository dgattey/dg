import { SESSION_MAX_AGE_SECONDS } from './session';

type CookieOptions = {
  httpOnly: boolean;
  maxAge: number;
  path: string;
  sameSite: 'lax';
  secure: boolean;
};

/** Secure cookies on Vercel / production; allow HTTP localhost. */
export function shouldUseSecureCookies(): boolean {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
}

export function oauthTempCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    maxAge: 10 * 60,
    path: '/',
    sameSite: 'lax',
    secure: shouldUseSecureCookies(),
  };
}

export function sessionCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: '/',
    sameSite: 'lax',
    secure: shouldUseSecureCookies(),
  };
}

export function clearCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: shouldUseSecureCookies(),
  };
}
