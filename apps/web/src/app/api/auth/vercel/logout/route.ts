import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { clearCookieOptions } from '../../../../../auth/vercel/cookieOptions';
import { VERCEL_SESSION_COOKIE } from '../../../../../auth/vercel/session';
import { redirectToConsole } from '../redirectToConsole';

/**
 * Clears the signed Vercel Flags session cookie and returns to the console.
 * Accepts GET (link) and POST (form / fetch).
 */
export function GET(request: NextRequest) {
  return clearSessionAndRedirect(request);
}

export function POST(request: NextRequest) {
  return clearSessionAndRedirect(request);
}

async function clearSessionAndRedirect(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.set(VERCEL_SESSION_COOKIE, '', clearCookieOptions());
  return redirectToConsole(request);
}
