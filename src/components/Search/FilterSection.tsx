import React from 'react';
import { LocationFilter } from '@/components/ui/location-filter';
import { SortFilter } from '@/components/ui/sort-filter';

interface FilterSectionProps {
  cities: string[];
  neighborhoods: string[];
  selectedCity: string | null;
  selectedNeighborhood: string | null;
  onCityChange: (city: string | null) => void;
  onNeighborhoodChange: (neighborhood: string | null) => void;
  sortBy: 'newest' | 'oldest' | 'price-high' | 'price-low';
  onSortChange: (sort: 'newest' | 'oldest' | 'price-high' | 'price-low') => void;
  totalCount: number;
  filteredCount: number;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  cities,
  neighborhoods,
  selectedCity,
  selectedNeighborhood,
  onCityChange,
  onNeighborhoodChange,
  sortBy,
  onSortChange,
  totalCount,
  filteredCount
}) => {
  return (
    <div className="space-y-4">
      <LocationFilter
        cities={cities}
        neighborhoods={neighborhoods}
        selectedCity={selectedCity}
        selectedNeighborhood={selectedNeighborhood}
        onCityChange={onCityChange}
        onNeighborhoodChange={onNeighborhoodChange}
        totalCount={totalCount}
        filteredCount={filteredCount}
      />
      
      <SortFilter
        sortBy={sortBy}
        onSortChange={onSortChange}
      />
    </div>
  );
};