import { useMemo, useState, useEffect } from 'react';
import { OLXSearchResult } from '@/types/olx';
import { extractPriceNumber } from '@/lib/pricing-utils';

export const useListingFilters = (searchResult: OLXSearchResult | null) => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-high' | 'price-low'>('newest');

  // Extract unique cities, neighborhoods and filter/sort listings
  const { cities, neighborhoods, filteredListings } = useMemo(() => {
    if (!searchResult) return { cities: [], neighborhoods: [], filteredListings: [] };
    
    // Extract unique cities and neighborhoods from locations
    const citySet = new Set<string>();
    const neighborhoodSet = new Set<string>();
    const cityNeighborhoodMap = new Map<string, Set<string>>();
    
    searchResult.listings.forEach(listing => {
      const locationParts = listing.location.split(',').map(part => part.trim());
      const city = locationParts[0];
      const neighborhood = locationParts[1];
      
      if (city) {
        citySet.add(city);
        if (!cityNeighborhoodMap.has(city)) {
          cityNeighborhoodMap.set(city, new Set());
        }
        if (neighborhood) {
          neighborhoodSet.add(neighborhood);
          cityNeighborhoodMap.get(city)?.add(neighborhood);
        }
      }
    });
    
    const cities = Array.from(citySet).sort();
    
    // Get neighborhoods for selected city or all neighborhoods
    const availableNeighborhoods: string[] = selectedCity && cityNeighborhoodMap.has(selectedCity)
      ? Array.from(cityNeighborhoodMap.get(selectedCity) || new Set<string>()).sort()
      : Array.from(neighborhoodSet).sort();
    
    // Filter listings by city and neighborhood
    let filtered = searchResult.listings;
    
    if (selectedCity) {
      filtered = filtered.filter(listing => 
        listing.location.split(',')[0].trim() === selectedCity
      );
    }
    
    if (selectedNeighborhood) {
      filtered = filtered.filter(listing => 
        listing.location.split(',')[1]?.trim() === selectedNeighborhood
      );
    }
    
    // Sort listings
    const sortedFiltered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
        case 'oldest':
          return new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime();
        case 'price-high': {
          try {
            // Ensure price is a string, default to empty string if not
            const priceA = extractPriceNumber(String(a.price || ''));
            const priceB = extractPriceNumber(String(b.price || ''));
            
            // Handle zero prices (non-numeric) - put them at the end
            if (priceA === 0 && priceB === 0) return 0;
            if (priceA === 0) return 1; // a goes after b
            if (priceB === 0) return -1; // b goes after a
            
            return priceB - priceA; // Normal descending sort for numeric prices
          } catch (error) {
            console.warn('Price sorting error:', error);
            return 0;
          }
        }
        case 'price-low': {
          try {
            // Ensure price is a string, default to empty string if not
            const priceA = extractPriceNumber(String(a.price || ''));
            const priceB = extractPriceNumber(String(b.price || ''));
            
            // Handle zero prices (non-numeric) - put them at the end
            if (priceA === 0 && priceB === 0) return 0;
            if (priceA === 0) return 1; // a goes after b
            if (priceB === 0) return -1; // b goes after a
            
            return priceA - priceB; // Normal ascending sort for numeric prices
          } catch (error) {
            console.warn('Price sorting error:', error);
            return 0;
          }
        }
        default:
          return 0;
      }
    });
    
    return { cities, neighborhoods: availableNeighborhoods, filteredListings: sortedFiltered };
  }, [searchResult, selectedCity, selectedNeighborhood, sortBy]);

  // Reset neighborhood when city changes
  useEffect(() => {
    if (selectedCity && selectedNeighborhood) {
      // Check if current neighborhood is available for selected city
      if (!neighborhoods.includes(selectedNeighborhood)) {
        setSelectedNeighborhood(null);
      }
    }
  }, [selectedCity, neighborhoods, selectedNeighborhood]);

  return {
    cities,
    neighborhoods,
    filteredListings,
    selectedCity,
    selectedNeighborhood,
    sortBy,
    setSelectedCity,
    setSelectedNeighborhood,
    setSortBy
  };
};