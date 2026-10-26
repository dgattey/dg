import 'server-only';

import { cookies } from 'next/headers';
import {
  isDevConsoleAccessAllowed,
  parseVercelSessionCookie,
  VERCEL_SESSION_COOKIE,
  type VercelSessionUser,
} from './session';

/** Reads the signed Vercel session for the current request. */
export async function getVercelSession(): Promise<VercelSessionUser | null> {
  const cookieStore = await cookies();
  return parseVercelSessionCookie(cookieStore.get(VERCEL_SESSION_COOKIE)?.value);
}

/** Returns true when the current request is authorized to access `/dev-console` tools. */
export async function isDevConsoleAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return isDevConsoleAccessAllowed(cookieStore.get(VERCEL_SESSION_COOKIE)?.value);
}
