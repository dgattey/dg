'use client';

import { useSyncExternalStore } from 'react';
import {
  applyColorSchemePreference,
  COLOR_SCHEME_STORAGE_KEY,
  type ColorScheme,
  type ColorSchemePreference,
  DEFAULT_COLOR_SCHEME_PREFERENCE,
  parseColorSchemePreference,
  readStoredColorSchemePreference,
} from './colorScheme';

const subscribers = new Set<() => void>();

function notifySubscribers() {
  for (const subscriber of subscribers) {
    subscriber();
  }
}

const getServerSnapshot = (): ColorSchemePreference => DEFAULT_COLOR_SCHEME_PREFERENCE;

function subscribe(onStoreChange: () => void): () => void {
  subscribers.add(onStoreChange);

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== COLOR_SCHEME_STORAGE_KEY) {
      return;
    }
    applyColorSchemePreference(parseColorSchemePreference(event.newValue));
    onStoreChange();
  };
  window.addEventListener('storage', handleStorage);

  return () => {
    subscribers.delete(onStoreChange);
    window.removeEventListener('storage', handleStorage);
  };
}

function setPreference(preference: ColorSchemePreference) {
  try {
    if (preference === DEFAULT_COLOR_SCHEME_PREFERENCE) {
      localStorage.removeItem(COLOR_SCHEME_STORAGE_KEY);
    } else {
      localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, preference);
    }
  } catch {}
  applyColorSchemePreference(preference);
  notifySubscribers();
}

const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';

function subscribeToSystemScheme(onStoreChange: () => void): () => void {
  const media = window.matchMedia(SYSTEM_DARK_QUERY);
  media.addEventListener('change', onStoreChange);
  return () => media.removeEventListener('change', onStoreChange);
}

const getSystemSchemeSnapshot = (): ColorScheme =>
  window.matchMedia(SYSTEM_DARK_QUERY).matches ? 'dark' : 'light';
const getServerSystemSchemeSnapshot = (): ColorScheme => 'light';

/**
 * The stored preference, the OS scheme, and the scheme those two resolve to.
 * On the server and through hydration the OS scheme reads as light, so markup
 * that must match the OS before hydration keys off CSS media queries instead.
 */
export function useColorScheme(): Readonly<{
  preference: ColorSchemePreference;
  scheme: ColorScheme;
  setPreference: (preference: ColorSchemePreference) => void;
  systemScheme: ColorScheme;
}> {
  const preference = useSyncExternalStore(
    subscribe,
    readStoredColorSchemePreference,
    getServerSnapshot,
  );
  const systemScheme = useSyncExternalStore(
    subscribeToSystemScheme,
    getSystemSchemeSnapshot,
    getServerSystemSchemeSnapshot,
  );
  const scheme = preference === 'system' ? systemScheme : preference;
  return { preference, scheme, setPreference, systemScheme };
}
