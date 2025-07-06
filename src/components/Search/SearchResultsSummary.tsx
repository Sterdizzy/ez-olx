import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OLXSearchResult } from '@/types/olx';

interface SearchResultsSummaryProps {
  searchResult: OLXSearchResult;
  filteredCount: number;
}

export const SearchResultsSummary: React.FC<SearchResultsSummaryProps> = ({
  searchResult,
  filteredCount
}) => {
  const pagesInfo = searchResult.pagination ? 
    ` from ${searchResult.pagination.pagesLoaded.length} page${searchResult.pagination.pagesLoaded.length > 1 ? 's' : ''}` : 
    '';
    
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Search Results</span>
          <div className="flex gap-2">
            <Badge variant="secondary">
              {searchResult.totalResults} total{pagesInfo}
            </Badge>
            {filteredCount !== searchResult.totalResults && (
              <Badge variant="outline">
                {filteredCount} filtered
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground line-clamp-1">
          Source: {searchResult.url}
        </p>
        {searchResult.pagination && (
          <p className="text-xs text-muted-foreground">
            Multi-page extraction completed • Pages loaded: {searchResult.pagination.pagesLoaded.join(', ')}
          </p>
        )}
      </CardContent>
    </Card>
  );
};