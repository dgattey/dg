import { vercelAdapter } from '@flags-sdk/vercel';
import type { ReadonlyRequestCookies } from 'flags';
import { dedupe, flag } from 'flags/next';
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

/**
 * Gates the interactive redesign surface.
 * Falls back to false when FLAGS is missing (CI/tests) or evaluation fails.
 * When Sign in with Vercel has established a session, `user.id` / `user.email`
 * are sent for segment targeting.
 */
export const interactiveRedesign = flag<boolean, FlagEntities>({
  adapter: vercelAdapter,
  defaultValue: false,
  description: 'The new redesign that adds interactivity and maps to more of the site',
  identify,
  key: 'interactive-redesign',
});
