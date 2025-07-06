import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Link, MapPin, AlertCircle } from 'lucide-react';

interface OLXSearchInputProps {
  onSearch: (url: string) => void;
  isLoading?: boolean;
}

const OLXSearchInput: React.FC<OLXSearchInputProps> = ({ onSearch, isLoading = false }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const validateOLXUrl = (inputUrl: string): boolean => {
    try {
      const urlObj = new URL(inputUrl);
      const validDomains = ['olx.com.br', 'olx.pl', 'olx.pt', 'olx.com.pe', 'olx.com.ar'];
      return validDomains.some(domain => urlObj.hostname.includes(domain));
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!url.trim()) {
      setError('Please enter an OLX search URL');
      return;
    }

    if (!validateOLXUrl(url)) {
      setError('Please enter a valid OLX search URL (e.g., olx.com.br, olx.pl, etc.)');
      return;
    }

    onSearch(url.trim());
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Search className="h-5 w-5" />
          OLX Search Results Visualizer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground text-sm sm:text-base">
            Paste an OLX search URL to visualize listings on a map
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="outline" className="text-xs">olx.com.br</Badge>
            <Badge variant="outline" className="text-xs">olx.pl</Badge>
            <Badge variant="outline" className="text-xs">olx.pt</Badge>
            <Badge variant="outline" className="text-xs">olx.com.pe</Badge>
            <Badge variant="outline" className="text-xs">olx.com.ar</Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
            <div className="relative flex-1">
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="url"
                placeholder="Paste OLX search URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10 h-12 sm:h-10 text-base sm:text-sm"
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading || !url.trim()}
              className="h-12 sm:h-10 px-6 sm:px-4 text-base sm:text-sm min-w-[120px] sm:min-w-auto"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                  <span className="hidden sm:inline">Processing...</span>
                  <span className="sm:hidden">Loading...</span>
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Map Results</span>
                  <span className="sm:hidden">Search</span>
                </>
              )}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>

        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-2">How it works:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Copy a search URL from OLX (after filtering for what you want)</li>
            <li>Paste it above and click "Map Results"</li>
            <li>View all listings plotted on an interactive map</li>
            <li>Click markers to see listing details and prices</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default OLXSearchInput;