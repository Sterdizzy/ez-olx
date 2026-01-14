import { useState, useEffect, useCallback } from 'react';
import { OLXListing } from '@/types/olx';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '@/lib/storage';

interface SavedListing extends OLXListing {
  savedAt: string; // ISO timestamp
}

export function useSavedListings() {
  const [savedListings, setSavedListings] = useState<SavedListing[]>(() => {
    return getFromStorage<SavedListing[]>(STORAGE_KEYS.SAVED_LISTINGS, []);
  });

  // Sync to localStorage whenever savedListings changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SAVED_LISTINGS, savedListings);
  }, [savedListings]);

  /**
   * Check if a listing is saved
   */
  const isSaved = useCallback((listingId: string): boolean => {
    return savedListings.some(listing => listing.id === listingId);
  }, [savedListings]);

  /**
   * Toggle a listing's saved status
   */
  const toggleSaved = useCallback((listing: OLXListing) => {
    setSavedListings(prev => {
      const isCurrentlySaved = prev.some(item => item.id === listing.id);

      if (isCurrentlySaved) {
        // Remove from saved
        return prev.filter(item => item.id !== listing.id);
      } else {
        // Add to saved
        const savedListing: SavedListing = {
          ...listing,
          savedAt: new Date().toISOString(),
        };
        return [savedListing, ...prev]; // Add to beginning
      }
    });
  }, []);

  /**
   * Remove a listing from saved
   */
  const removeSaved = useCallback((listingId: string) => {
    setSavedListings(prev => prev.filter(item => item.id !== listingId));
  }, []);

  /**
   * Clear all saved listings
   */
  const clearAllSaved = useCallback(() => {
    setSavedListings([]);
  }, []);

  return {
    savedListings,
    isSaved,
    toggleSaved,
    removeSaved,
    clearAllSaved,
  };
}
