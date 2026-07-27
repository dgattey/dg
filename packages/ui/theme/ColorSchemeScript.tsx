/**
 * Blocking head script tag. Must be rendered under <head> in the root layout
 * so it runs before body paint when an explicit preference is stored.
 *
 * Script body lives at /color-scheme-init.js (apps/web/public). Keys there must
 * stay aligned with COLOR_SCHEME_* constants in colorScheme.ts.
 *
 * Sync (no async/defer) is intentional: async/defer would paint before the
 * preference is applied and flash the wrong scheme.
 */
export function ColorSchemeScript() {
  // biome-ignore lint/performance/noSyncScripts: must block paint to avoid FOUC
  return <script src="/color-scheme-init.js" />;
}
