// Safe storage abstraction for sandboxed iframes, private browsing, or restricted storage policies.
// If window.localStorage is blocked or throws a SecurityError / DOMException,
// it gracefully falls back to an in-memory key-value map so the app never crashes.

const memoryStorage = new Map<string, string>();

let isLocalStorageAvailable: boolean | null = null;

function checkLocalStorageAvailability(): boolean {
  if (isLocalStorageAvailable !== null) return isLocalStorageAvailable;
  if (typeof window === 'undefined') {
    isLocalStorageAvailable = false;
    return false;
  }

  try {
    const testKey = '__farm2door_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    isLocalStorageAvailable = true;
    return true;
  } catch {
    console.warn('LocalStorage is blocked or unavailable in this environment (sandboxed iframe). Using safe in-memory fallback.');
    isLocalStorageAvailable = false;
    return false;
  }
}

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (checkLocalStorageAvailability()) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Fall through to memory
    }
    return memoryStorage.get(key) ?? null;
  },

  setItem: (key: string, value: string): void => {
    try {
      if (checkLocalStorageAvailability()) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      // Fall through to memory
    }
    memoryStorage.set(key, value);
  },

  removeItem: (key: string): void => {
    try {
      if (checkLocalStorageAvailability()) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch {
      // Fall through to memory
    }
    memoryStorage.delete(key);
  },

  clear: (): void => {
    try {
      if (checkLocalStorageAvailability()) {
        window.localStorage.clear();
      }
    } catch {
      // Fall through to memory
    }
    memoryStorage.clear();
  }
};
