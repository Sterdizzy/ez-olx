export interface OLXListing {
  id: string;
  title: string;
  price: string;
  currency?: string;
  location: string;
  images: string[];
  link: string;
  description?: string;
  postedDate?: string;
  category?: string;
  squareMeters?: string;
  bedrooms?: string;
}

export interface OLXSearchResult {
  url: string;
  searchQuery: string;
  totalResults: number;
  listings: OLXListing[];
  lastUpdated: string;
  pagination?: {
    currentPages: number;
    totalPages?: number;
    pagesLoaded: number[];
  };
}
