import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface SortFilterProps {
  sortBy: 'newest' | 'oldest' | 'price-high' | 'price-low';
  onSortChange: (sort: 'newest' | 'oldest' | 'price-high' | 'price-low') => void;
}

export const SortFilter: React.FC<SortFilterProps> = ({
  sortBy,
  onSortChange
}) => {
  const getSortLabel = (value: string) => {
    switch (value) {
      case 'newest': return 'Data: Mais recente';
      case 'oldest': return 'Data: Mais antiga';
      case 'price-high': return 'Preço: Maior';
      case 'price-low': return 'Preço: Menor';
      default: return 'Sort by...';
    }
  };

  const getSortIcon = () => {
    if (sortBy === 'newest' || sortBy === 'price-high') {
      return <ArrowDown className="h-4 w-4 text-muted-foreground" />;
    }
    return <ArrowUp className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        {getSortIcon()}
        <span className="text-sm font-medium">Sort by:</span>
      </div>
      
      <Select
        value={sortBy}
        onValueChange={(value) => onSortChange(value as 'newest' | 'oldest' | 'price-high' | 'price-low')}
      >
        <SelectTrigger className="w-full sm:w-48 h-12 sm:h-10">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Data: Mais recente</SelectItem>
          <SelectItem value="oldest">Data: Mais antiga</SelectItem>
          <SelectItem value="price-high">Preço: Maior</SelectItem>
          <SelectItem value="price-low">Preço: Menor</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};