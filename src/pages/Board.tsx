import React from 'react';
import { SearchSetup } from '@/components/Search/SearchSetup';
import { SearchProgress } from '@/components/Search/SearchProgress';
import { SearchResultsSummary } from '@/components/Search/SearchResultsSummary';
import { FilterSection } from '@/components/Search/FilterSection';
import { ResultsDisplay } from '@/components/Search/ResultsDisplay';
import { useOLXSearch } from '@/hooks/useOLXSearch';
import { useListingFilters } from '@/hooks/useListingFilters';

const Board = () => {
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

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 px-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            OLX Search Tool
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
            Extract and filter OLX search results with smart location and price filtering
          </p>
        </div>

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