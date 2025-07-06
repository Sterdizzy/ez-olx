import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import OLXSearchInput from '@/components/Search/OLXSearchInput';

interface SearchSetupProps {
  onOLXSearch: (url: string) => Promise<void>;
  isLoading: boolean;
  maxPages: number;
  onMaxPagesChange: (pages: number) => void;
}

export const SearchSetup: React.FC<SearchSetupProps> = ({
  onOLXSearch,
  isLoading,
  maxPages,
  onMaxPagesChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Search Configuration</span>
          <Badge variant="secondary" className="text-xs">
            Multi-page extraction
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Pages to extract</label>
          <Select 
            value={maxPages.toString()} 
            onValueChange={(value) => onMaxPagesChange(parseInt(value))}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 page (~25 results)</SelectItem>
              <SelectItem value="3">3 pages (~75 results)</SelectItem>
              <SelectItem value="5">5 pages (~125 results)</SelectItem>
              <SelectItem value="10">10 pages (~250 results)</SelectItem>
              <SelectItem value="20">20 pages (~500 results)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            More pages = more results but slower loading. Rate limited to avoid blocking.
          </p>
        </div>
        
        <OLXSearchInput onSearch={onOLXSearch} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
};