import 'server-only';

import { cookies } from 'next/headers';
import { parseVercelSessionCookie, VERCEL_SESSION_COOKIE, type VercelSessionUser } from './session';

/** Reads the signed Vercel Flags session for the current request. */
export async function getVercelSession(): Promise<VercelSessionUser | null> {
  const cookieStore = await cookies();
  return parseVercelSessionCookie(cookieStore.get(VERCEL_SESSION_COOKIE)?.value);
}
