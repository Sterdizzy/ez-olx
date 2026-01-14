/**
 * LocalStorage utility for managing persistent data
 */

const STORAGE_KEYS = {
  SAVED_LISTINGS: 'olx_saved_listings',
  RECENT_SEARCHES: 'olx_recent_searches',
} as const;

/**
 * Generic function to get data from localStorage
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
}

/**
 * Generic function to save data to localStorage
 */
export function saveToStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
}

/**
 * Generic function to remove data from localStorage
 */
export function removeFromStorage(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
  }
}

export { STORAGE_KEYS };
