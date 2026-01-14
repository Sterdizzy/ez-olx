import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OLXListing } from '@/types/olx';
import { MapPin, ExternalLink, Calendar, Heart } from 'lucide-react';
import { useSavedListings } from '@/hooks/useSavedListings';
import { toast } from 'sonner';

interface ResultsDisplayProps {
  filteredListings: OLXListing[];
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  filteredListings
}) => {
  const { isSaved, toggleSaved } = useSavedListings();

  const handleToggleSave = (listing: OLXListing) => {
    const wasSaved = isSaved(listing.id);
    toggleSaved(listing);

    if (wasSaved) {
      toast.success('Removed from saved listings');
    } else {
      toast.success('Added to saved listings');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Search Results</h2>
        <Badge variant="secondary">
          {filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredListings.map((listing) => (
          <Card key={listing.id} className="hover:shadow-md transition-shadow relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={() => handleToggleSave(listing)}
            >
              <Heart
                className={`h-5 w-5 ${
                  isSaved(listing.id)
                    ? 'fill-red-500 text-red-500'
                    : 'text-muted-foreground'
                }`}
              />
            </Button>
            <CardHeader className="pb-3">
              <div className="aspect-video bg-muted rounded-md mb-3 overflow-hidden">
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                  onLoad={() => console.log('✅ Image loaded successfully:', listing.images[0])}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    console.log('❌ Image failed to load:', listing.images[0]);
                    target.src = '/placeholder.svg';
                  }}
                />
              </div>
              <CardTitle className="text-sm sm:text-base line-clamp-2 leading-tight">{listing.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-lg sm:text-xl font-bold text-primary">
                {listing.price}
              </div>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="line-clamp-1">{listing.location}</span>
              </div>

              {/* Additional property details */}
              <div className="flex flex-wrap gap-2 text-xs">
                {listing.squareMeters && (
                  <Badge variant="secondary" className="text-xs">
                    📐 {listing.squareMeters}
                  </Badge>
                )}
                {listing.bedrooms && (
                  <Badge variant="secondary" className="text-xs">
                    🛏️ {listing.bedrooms}
                  </Badge>
                )}
                {listing.postedDate && listing.postedDate !== new Date().toISOString().split('T')[0] && (
                  <Badge variant="outline" className="text-xs">
                    📅 {new Date(listing.postedDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                  </Badge>
                )}
              </div>

              {/* Description preview */}
              {listing.description && listing.description !== listing.title && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {listing.description}
                </p>
              )}

              <Button 
                size="sm" 
                className="w-full h-10 text-sm"
                onClick={() => window.open(listing.link, '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                View on OLX
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};