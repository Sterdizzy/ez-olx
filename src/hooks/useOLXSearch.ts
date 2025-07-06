import { useState } from 'react';
import { OLXDataExtractor } from '@/components/Search/OLXDataExtractor';
import { OLXSearchResult, OLXListing } from '@/types/olx';

export const useOLXSearch = () => {
  const [searchResult, setSearchResult] = useState<OLXSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [maxPages, setMaxPages] = useState(3);

  // Helper function to extract with progress updates
  const extractWithProgress = async (url: string, pages: number, onProgress: (page: number, total: number) => void) => {
    const allListings: OLXListing[] = [];
    
    for (let page = 1; page <= pages; page++) {
      onProgress(page, pages);
      
      const pageUrl = page === 1 ? url : `${url}${url.includes('?') ? '&' : '?'}o=${page}`;
      
      try {
        const pageListings = await OLXDataExtractor.extractFromUrl(pageUrl, 1);
        
        if (pageListings.length === 0) {
          console.log(`⚠️ No listings found on page ${page}, stopping extraction`);
          break;
        }
        
        allListings.push(...pageListings);
        console.log(`✅ Page ${page} complete: ${pageListings.length} listings (total: ${allListings.length})`);
        
        // Rate limiting between pages
        if (page < pages) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      } catch (error) {
        console.warn(`❌ Failed to load page ${page}:`, error);
        // Continue with other pages even if one fails
      }
    }
    
    return allListings;
  };

  const handleOLXSearch = async (url: string) => {
    setIsLoading(true);
    setProgress(0);
    setError(null);
    setCurrentStep(`Extracting listings from ${maxPages} page${maxPages > 1 ? 's' : ''}...`);

    try {
      console.log('🚀 About to extract listings from URL:', url, `(${maxPages} pages)`);
      
      // Progress callback to update UI during extraction
      const updateProgress = (page: number, total: number) => {
        const progressPercent = Math.round((page / total) * 90); // Save 10% for finalization
        setProgress(progressPercent);
        setCurrentStep(`Loading page ${page} of ${total}...`);
      };

      // Extract listings from multiple pages
      setProgress(10);
      const listings = await extractWithProgress(url, maxPages, updateProgress);
      console.log('🎯 Received listings:', listings.length, 'items from', maxPages, 'pages');
      
      if (listings.length === 0) {
        throw new Error('No listings found in the provided URL');
      }

      setCurrentStep('Finalizing data...');
      setProgress(100);

      const result: OLXSearchResult = {
        url,
        searchQuery: new URL(url).search,
        totalResults: listings.length,
        listings: listings,
        lastUpdated: new Date().toISOString(),
        pagination: {
          currentPages: maxPages,
          pagesLoaded: Array.from({length: maxPages}, (_, i) => i + 1)
        }
      };

      setSearchResult(result);
      
      setTimeout(() => {
        setIsLoading(false);
      }, 500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process OLX search');
      setIsLoading(false);
      setProgress(0);
      setCurrentStep('');
    }
  };

  return {
    searchResult,
    isLoading,
    progress,
    currentStep,
    error,
    maxPages,
    setMaxPages,
    handleOLXSearch
  };
};