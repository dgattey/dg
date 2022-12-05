import { useState } from 'react';

export type LocalStorageKey = 'colorScheme';

/**
 * Gets a value and returns it. If missing, returns the
 * initial value instead. On error, also returns initial value.
 */
const getValue = <Value>(key: string, initialValue: Value) => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse<Value>(item) : initialValue;
  } catch {
    return initialValue;
  }
};

/**
 * Uses local storage to fetch/store a given value.
 */
export const useLocalStorageValue = <Value>(key: LocalStorageKey, initialValue: Value) => {
  const resolvedKey = `com.dg.${key}`;
  const [storedValue, setStoredValue] = useState<Value | null>(() =>
    getValue(resolvedKey, initialValue),
  );

  /**
   * Saves a new value to local storage, returning if it was saved
   * successfully.
   */
  const setValue = (value: Value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(resolvedKey, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  };

  /**
   * Deletes the value from local storage, returning if it was deleted
   * successfully.
   */
  const deleteValue = () => {
    try {
      setStoredValue(null);
      window.localStorage.removeItem(resolvedKey);
      return true;
    } catch {
      return false;
    }
  };

  return [storedValue, setValue, deleteValue] as const;
};
