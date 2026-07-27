'use client';

import { useSyncExternalStore } from 'react';
import {
  COLOR_SCHEME_ATTRIBUTE,
  COLOR_SCHEME_STORAGE_KEY,
  type ColorSchemePreference,
  colorSchemeDeclaration,
  DEFAULT_COLOR_SCHEME_PREFERENCE,
  parseColorSchemePreference,
} from './colorScheme';

let inMemorySnapshot: ColorSchemePreference = DEFAULT_COLOR_SCHEME_PREFERENCE;

function applyPreference(preference: ColorSchemePreference) {
  const root = document.documentElement;
  if (preference === 'system') {
    root.removeAttribute(COLOR_SCHEME_ATTRIBUTE);
  } else {
    root.setAttribute(COLOR_SCHEME_ATTRIBUTE, preference);
  }
  root.style.colorScheme = colorSchemeDeclaration(preference);
}

function getSnapshot(): ColorSchemePreference {
  inMemorySnapshot = parseColorSchemePreference(
    document.documentElement.getAttribute(COLOR_SCHEME_ATTRIBUTE),
  );
  return inMemorySnapshot;
}

const getServerSnapshot = (): ColorSchemePreference => DEFAULT_COLOR_SCHEME_PREFERENCE;

function subscribe(onStoreChange: () => void): () => void {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributeFilter: [COLOR_SCHEME_ATTRIBUTE],
    attributes: true,
  });

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== COLOR_SCHEME_STORAGE_KEY) {
      return;
    }
    inMemorySnapshot = parseColorSchemePreference(event.newValue);
    applyPreference(inMemorySnapshot);
    onStoreChange();
  };
  window.addEventListener('storage', handleStorage);

  return () => {
    observer.disconnect();
    window.removeEventListener('storage', handleStorage);
  };
}

function setPreference(preference: ColorSchemePreference) {
  inMemorySnapshot = preference;
  try {
    if (preference === 'system') {
      localStorage.removeItem(COLOR_SCHEME_STORAGE_KEY);
    } else {
      localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, preference);
    }
    localStorage.removeItem('mui-mode');
  } catch {}
  applyPreference(preference);
}

export function useColorScheme(): Readonly<{
  preference: ColorSchemePreference;
  setPreference: (preference: ColorSchemePreference) => void;
}> {
  const preference = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { preference, setPreference };
}
