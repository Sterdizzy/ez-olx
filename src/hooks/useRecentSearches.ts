import { useState, useEffect, useCallback } from 'react';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '@/lib/storage';

export interface RecentSearch {
  id: string;
  url: string;
  searchedAt: string; // ISO timestamp
  totalResults: number;
  maxPages: number;
}

const MAX_RECENT_SEARCHES = 10;

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(() => {
    return getFromStorage<RecentSearch[]>(STORAGE_KEYS.RECENT_SEARCHES, []);
  });

  // Sync to localStorage whenever recentSearches changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.RECENT_SEARCHES, recentSearches);
  }, [recentSearches]);

  /**
   * Add a search to recent searches
   */
  const addRecentSearch = useCallback((search: Omit<RecentSearch, 'id' | 'searchedAt'>) => {
    setRecentSearches(prev => {
      // Remove duplicate URLs
      const filtered = prev.filter(item => item.url !== search.url);

      // Create new search entry
      const newSearch: RecentSearch = {
        ...search,
        id: `search_${Date.now()}`,
        searchedAt: new Date().toISOString(),
      };

      // Add to beginning and limit to MAX_RECENT_SEARCHES
      return [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    });
  }, []);

  /**
   * Remove a search from recent searches
   */
  const removeRecentSearch = useCallback((searchId: string) => {
    setRecentSearches(prev => prev.filter(item => item.id !== searchId));
  }, []);

  /**
   * Clear all recent searches
   */
  const clearAllRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, []);

  return {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearAllRecentSearches,
  };
}
