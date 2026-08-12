'use client';

import { useSyncExternalStore } from 'react';
import {
  applyColorSchemePreference,
  COLOR_SCHEME_LEGACY_STORAGE_KEY,
  COLOR_SCHEME_STORAGE_KEY,
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
    localStorage.removeItem(COLOR_SCHEME_LEGACY_STORAGE_KEY);
  } catch {}
  applyColorSchemePreference(preference);
  notifySubscribers();
}

export function useColorScheme(): Readonly<{
  preference: ColorSchemePreference;
  setPreference: (preference: ColorSchemePreference) => void;
}> {
  const preference = useSyncExternalStore(
    subscribe,
    readStoredColorSchemePreference,
    getServerSnapshot,
  );
  return { preference, setPreference };
}
