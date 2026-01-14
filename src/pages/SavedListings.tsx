import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSavedListings } from '@/hooks/useSavedListings';
import { MapPin, ExternalLink, Heart, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const SavedListings: React.FC = () => {
  const navigate = useNavigate();
  const { savedListings, removeSaved, clearAllSaved } = useSavedListings();
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  const handleRemove = (listingId: string) => {
    removeSaved(listingId);
    toast.success('Removed from saved listings');
  };

  const handleClearAll = () => {
    clearAllSaved();
    toast.success('All saved listings cleared');
  };

  const sortedListings = [...savedListings].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
    } else {
      return new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime();
    }
  });

  if (savedListings.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/board')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
          <h1 className="text-3xl font-bold mb-2">Saved Listings</h1>
          <p className="text-muted-foreground">Your favorite apartments will appear here</p>
        </div>

        <Card className="text-center py-12">
          <CardContent>
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No saved listings yet</h3>
            <p className="text-muted-foreground mb-4">
              Start saving listings by clicking the heart icon on any apartment
            </p>
            <Button onClick={() => navigate('/board')}>
              Browse Listings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/board')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Saved Listings</h1>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all saved listings?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all {savedListings.length} saved listing{savedListings.length !== 1 ? 's' : ''} from your collection. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAll}>Clear All</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary">
            {savedListings.length} saved listing{savedListings.length !== 1 ? 's' : ''}
          </Badge>
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'newest' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('newest')}
            >
              Newest First
            </Button>
            <Button
              variant={sortBy === 'oldest' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('oldest')}
            >
              Oldest First
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedListings.map((listing) => (
          <Card key={listing.id} className="hover:shadow-md transition-shadow relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background hover:text-destructive"
              onClick={() => handleRemove(listing.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <CardHeader className="pb-3">
              <div className="aspect-video bg-muted rounded-md mb-3 overflow-hidden">
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </div>
              <CardTitle className="text-sm sm:text-base line-clamp-2 leading-tight">
                {listing.title}
              </CardTitle>
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

              {/* Saved date */}
              <div className="text-xs text-muted-foreground">
                Saved {new Date(listing.savedAt).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
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
