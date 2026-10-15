import { log } from '@dg/shared-core/logging/log';
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

const INTERACTIVE_REDESIGN_KEY = 'interactive-redesign';

/**
 * Vercel bills one Flag Request for every request that reads the flags
 * config, and the Hobby plan pauses the project after 10,000 a month. The
 * proxy runs on every page, RSC fetch, prefetch, and Server Action, so a
 * visitor's decision is reused for this long instead of read per request.
 */
const DECISION_TTL_MS = 60_000;

/**
 * Builds the adapter without contacting Vercel, so the discovery endpoint
 * keeps the flag's origin in every environment. An invalid FLAGS value throws
 * here, at import time, which would otherwise 500 every proxied page.
 */
function createVercelAdapter() {
  try {
    return vercelAdapter<boolean, FlagEntities>();
  } catch (error) {
    log.error('Vercel Flags adapter unavailable; using flag defaults', { error });
    return undefined;
  }
}

const adapter = createVercelAdapter();
const decisions = new Map<string, { expiresAt: number; value: Promise<boolean> }>();

/**
 * Gates the interactive redesign surface.
 * Only production deployments read Vercel Flags. Local dev, CI, and previews
 * stay on the default unless a Vercel Toolbar override or
 * `INTERACTIVE_REDESIGN=1` turns it on. When Sign in with Vercel has
 * established a session, `user.id` / `user.email` are sent for segment
 * targeting.
 */
export const interactiveRedesign = flag<boolean, FlagEntities>({
  adapter,
  decide: ({ cookies, entities, headers }) => {
    if (!adapter || process.env.VERCEL_ENV !== 'production') {
      return false;
    }
    const cacheKey = JSON.stringify(entities ?? null);
    const now = Date.now();
    const cached = decisions.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.value;
    }
    const value = Promise.resolve(
      adapter.decide({ cookies, entities, headers, key: INTERACTIVE_REDESIGN_KEY }),
    );
    decisions.set(cacheKey, { expiresAt: now + DECISION_TTL_MS, value });
    value.catch(() => {
      if (decisions.get(cacheKey)?.value === value) {
        decisions.delete(cacheKey);
      }
    });
    return value;
  },
  defaultValue: false,
  description: 'The new redesign that adds interactivity and maps to more of the site',
  identify,
  key: INTERACTIVE_REDESIGN_KEY,
});
