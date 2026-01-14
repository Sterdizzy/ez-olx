import React from 'react';
import { SearchSetup } from '@/components/Search/SearchSetup';
import { SearchProgress } from '@/components/Search/SearchProgress';
import { SearchResultsSummary } from '@/components/Search/SearchResultsSummary';
import { FilterSection } from '@/components/Search/FilterSection';
import { ResultsDisplay } from '@/components/Search/ResultsDisplay';
import { RecentSearches } from '@/components/Search/RecentSearches';
import { useOLXSearch } from '@/hooks/useOLXSearch';
import { useListingFilters } from '@/hooks/useListingFilters';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import { useSavedListings } from '@/hooks/useSavedListings';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Board = () => {
  const navigate = useNavigate();
  const { addRecentSearch } = useRecentSearches();
  const { savedListings } = useSavedListings();

  const {
    searchResult,
    isLoading,
    progress,
    currentStep,
    error,
    maxPages,
    setMaxPages,
    handleOLXSearch
  } = useOLXSearch();

  const {
    cities,
    neighborhoods,
    filteredListings,
    selectedCity,
    selectedNeighborhood,
    sortBy,
    setSelectedCity,
    setSelectedNeighborhood,
    setSortBy
  } = useListingFilters(searchResult);

  const handleSearch = async (url: string) => {
    await handleOLXSearch(url);
  };

  // Add search to recent searches after successful search
  React.useEffect(() => {
    if (searchResult && !isLoading) {
      addRecentSearch({
        url: searchResult.url,
        totalResults: searchResult.totalResults,
        maxPages: maxPages,
      });
    }
  }, [searchResult, isLoading]);

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 px-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex-1">
              OLX Search Tool
            </h1>
            <div className="flex-1 flex justify-end">
              <Button
                variant="outline"
                onClick={() => navigate('/saved')}
                className="relative"
              >
                <Heart className="h-4 w-4 mr-2" />
                Saved Listings
                {savedListings.length > 0 && (
                  <Badge variant="destructive" className="ml-2 px-1.5 py-0 h-5 min-w-5 flex items-center justify-center">
                    {savedListings.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
            Extract and filter OLX search results with smart location and price filtering
          </p>
        </div>

        {/* Recent Searches */}
        {!searchResult && !isLoading && (
          <RecentSearches onSearchSelect={handleSearch} />
        )}

        {/* Search Setup */}
        <SearchSetup
          onOLXSearch={handleOLXSearch}
          isLoading={isLoading}
          maxPages={maxPages}
          onMaxPagesChange={setMaxPages}
        />

        {/* Search Progress and Errors */}
        <SearchProgress
          isLoading={isLoading}
          progress={progress}
          currentStep={currentStep}
          error={error}
        />

        {/* Search Results */}
        {searchResult && !isLoading && (
          <div className="space-y-4 sm:space-y-6">
            <SearchResultsSummary
              searchResult={searchResult}
              filteredCount={filteredListings.length}
            />

            <FilterSection
              cities={cities}
              neighborhoods={neighborhoods}
              selectedCity={selectedCity}
              selectedNeighborhood={selectedNeighborhood}
              onCityChange={setSelectedCity}
              onNeighborhoodChange={setSelectedNeighborhood}
              sortBy={sortBy}
              onSortChange={setSortBy}
              totalCount={searchResult.totalResults}
              filteredCount={filteredListings.length}
            />

            <ResultsDisplay
              filteredListings={filteredListings}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Board;