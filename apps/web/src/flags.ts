import type { ReadonlyRequestCookies } from 'flags';
import { dedupe } from 'flags/next';
import {
  entitiesFromSessionCookie,
  type FlagEntities,
  VERCEL_SESSION_COOKIE,
} from './auth/vercel/session';

/**
 * Reads the signed Vercel session cookie into Flags entities.
 * Deduped so multiple flags can share one identity lookup per request.
 */
export const identify = dedupe(
  ({ cookies }: { cookies: ReadonlyRequestCookies }): FlagEntities =>
    entitiesFromSessionCookie(cookies.get(VERCEL_SESSION_COOKIE)?.value),
);
