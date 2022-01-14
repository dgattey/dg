import { useState } from 'react';

export type LocalStorageKey = 'colorScheme';

/**
 * Uses local storage to fetch/store a given value.
 */
const useLocalStorageValue = <Value>(key: LocalStorageKey, initialValue: Value) => {
  const resolvedKey = `com.dg.${key}`;
  const [storedValue, setStoredValue] = useState<Value | null>(() => {
    try {
      const item = window.localStorage.getItem(resolvedKey);
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return item ? (JSON.parse(item) as Value) : initialValue;
    } catch {
      return initialValue;
    }
  });

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

export default useLocalStorageValue;
