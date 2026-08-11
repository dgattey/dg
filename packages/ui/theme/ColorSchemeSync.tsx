'use client';

import { useEffect, useLayoutEffect } from 'react';
import { applyColorSchemePreference, readStoredColorSchemePreference } from './colorScheme';

/** `<html>` renders on the server, where layout effects never run. */
const useBeforePaint = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Puts the stored color scheme back on `<html>` after every commit.
 *
 * React treats `<html>` as a host singleton it adopts rather than creates, and
 * on adoption it clears attributes that were not part of the server markup —
 * including the `data-color-scheme` the blocking head script just wrote. That
 * silently drops an explicit light/dark preference back to the OS scheme
 * partway through load. Restoring it from a layout effect lands in the same
 * commit as the wipe, so the wrong scheme never reaches the screen.
 */
export function ColorSchemeSync() {
  useBeforePaint(() => {
    applyColorSchemePreference(readStoredColorSchemePreference());
  });

  return null;
}
