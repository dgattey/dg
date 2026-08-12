'use client';

import { useEffect, useLayoutEffect } from 'react';
import {
  applyColorSchemePreference,
  COLOR_SCHEME_ATTRIBUTE,
  readStoredColorSchemePreference,
} from './colorScheme';

/** `<html>` renders on the server, where layout effects never run. */
const useBeforePaint = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Keeps `<html>` carrying the stored color scheme.
 *
 * React treats `<html>` as a host singleton it adopts rather than creates, and
 * on adoption it clears attributes that were not in the server markup —
 * including the `data-color-scheme` the blocking head script just wrote. That
 * silently drops an explicit light or dark choice to the OS scheme partway
 * through load, which is a flash of near-white for anyone who chose dark on a
 * light desktop.
 *
 * Mounting repairs the wipe from hydration itself, inside the same commit, so
 * the wrong scheme never paints. The observer covers every later wipe: React
 * only re-runs this effect when it re-renders this component, which a
 * `router.refresh()` need not do, and mutation callbacks land before the next
 * paint either way. Writing only on disagreement keeps the repair from
 * observing itself.
 */
export function ColorSchemeSync() {
  useBeforePaint(() => {
    const repair = () => {
      applyColorSchemePreference(readStoredColorSchemePreference());
    };
    repair();

    const observer = new MutationObserver(repair);
    observer.observe(document.documentElement, {
      attributeFilter: [COLOR_SCHEME_ATTRIBUTE],
      attributes: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
