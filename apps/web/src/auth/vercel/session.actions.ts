'use server';

import { devConsoleRoute } from '@dg/shared-core/routes/app';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { clearCookieOptions } from './cookieOptions';
import { VERCEL_SESSION_COOKIE } from './session';

/**
 * Clears the signed Vercel session cookie, then reloads `/dev-console`.
 */
export async function signOutOfVercel(): Promise<never> {
  const cookieStore = await cookies();
  cookieStore.set(VERCEL_SESSION_COOKIE, '', clearCookieOptions());
  redirect(devConsoleRoute);
}
