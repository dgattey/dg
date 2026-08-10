'use client';

/**
 * Flip after the first client commit so later Client Component mounts know
 * they are navigations, not the hydration that has to match SSR HTML.
 */
let clientHydrated = false;

export function hasClientHydrated() {
  return clientHydrated;
}

export function markClientHydrated() {
  clientHydrated = true;
}

export function resetClientHydrated() {
  clientHydrated = false;
}
