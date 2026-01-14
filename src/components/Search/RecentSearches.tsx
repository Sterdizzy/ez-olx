import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import { Clock, Search, Trash2, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RecentSearchesProps {
  onSearchSelect: (url: string) => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({ onSearchSelect }) => {
  const { recentSearches, removeRecentSearch, clearAllRecentSearches } = useRecentSearches();

  if (recentSearches.length === 0) {
    return null;
  }

  const handleRemove = (e: React.MouseEvent, searchId: string) => {
    e.stopPropagation();
    removeRecentSearch(searchId);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Searches
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllRecentSearches}
          >
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recentSearches.map((search) => (
            <div
              key={search.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer group"
              onClick={() => onSearchSelect(search.url)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-medium truncate">
                    {new URL(search.url).pathname.split('/').filter(Boolean).join(' / ')}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground ml-6">
                  <span>
                    {formatDistanceToNow(new Date(search.searchedAt), { addSuffix: true })}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {search.totalResults} results
                  </Badge>
                  <span>{search.maxPages} page{search.maxPages !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                onClick={(e) => handleRemove(e, search.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
