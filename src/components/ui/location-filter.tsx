import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

interface LocationFilterProps {
  cities: string[];
  neighborhoods: string[];
  selectedCity: string | null;
  selectedNeighborhood: string | null;
  onCityChange: (city: string | null) => void;
  onNeighborhoodChange: (neighborhood: string | null) => void;
  totalCount: number;
  filteredCount: number;
}

export const LocationFilter: React.FC<LocationFilterProps> = ({
  cities,
  neighborhoods,
  selectedCity,
  selectedNeighborhood,
  onCityChange,
  onNeighborhoodChange,
  totalCount,
  filteredCount
}) => {
  return (
    <div className="flex flex-col gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filter by Location:</span>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {/* City Filter */}
        <Select
          value={selectedCity || 'all'}
          onValueChange={(value) => onCityChange(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-full sm:w-48 h-12 sm:h-10">
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Neighborhood Filter */}
        <Select
          value={selectedNeighborhood || 'all'}
          onValueChange={(value) => onNeighborhoodChange(value === 'all' ? null : value)}
          disabled={neighborhoods.length === 0}
        >
          <SelectTrigger className="w-full sm:w-48 h-12 sm:h-10">
            <SelectValue placeholder="All Neighborhoods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Neighborhoods</SelectItem>
            {neighborhoods.map((neighborhood) => (
              <SelectItem key={neighborhood} value={neighborhood}>
                {neighborhood}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {filteredCount} of {totalCount}
        </Badge>
        {selectedCity && (
          <Badge variant="outline" className="text-xs">
            City: {selectedCity}
          </Badge>
        )}
        {selectedNeighborhood && (
          <Badge variant="outline" className="text-xs">
            Area: {selectedNeighborhood}
          </Badge>
        )}
      </div>
    </div>
  );
};