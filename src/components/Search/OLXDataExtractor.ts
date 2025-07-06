import { OLXListing } from '@/types/olx';

export class OLXDataExtractor {
  static async extractFromUrl(url: string, maxPages: number = 1): Promise<OLXListing[]> {
    console.log('🔍 Starting OLX extraction for:', url, `(${maxPages} page${maxPages > 1 ? 's' : ''})`);
    
    try {
      const allListings: OLXListing[] = [];
      const pagesLoaded: number[] = [];
      
      // Extract from multiple pages
      for (let page = 1; page <= maxPages; page++) {
        console.log(`📄 Processing page ${page} of ${maxPages}`);
        
        const pageUrl = this.buildPageUrl(url, page);
        console.log(`📡 Fetching page ${page}:`, pageUrl);
        
        // Use CORS proxy to fetch the HTML content
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(pageUrl)}`;
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
          console.warn(`❌ Failed to fetch page ${page}: ${response.status}`);
          continue;
        }

        const html = await response.text();
        const pageListings = this.parseOLXHtml(html, pageUrl);
        
        if (pageListings.length === 0) {
          console.log(`⚠️ No listings found on page ${page}, stopping extraction`);
          break;
        }
        
        allListings.push(...pageListings);
        pagesLoaded.push(page);
        console.log(`✅ Page ${page} complete: ${pageListings.length} listings (total: ${allListings.length})`);
        
        // Rate limiting - wait between requests to avoid being blocked
        if (page < maxPages) {
          console.log('⏳ Waiting 1.5 seconds before next page...');
          await this.delay(1500);
        }
      }
      
      console.log('✅ Multi-page extraction complete:', allListings.length, 'total listings from', pagesLoaded.length, 'pages');
      return allListings;
    } catch (error) {
      console.error('❌ Error extracting OLX data:', error);
      console.log('🔄 Falling back to mock data');
      return this.getMockData(url);
    }
  }

  private static buildPageUrl(baseUrl: string, page: number): string {
    if (page === 1) return baseUrl;
    
    // OLX uses &o=2, &o=3, etc. for pagination
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}o=${page}`;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private static parseOLXHtml(html: string, url: string): OLXListing[] {
    console.log('🔍 Starting HTML parsing...');
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const listings: OLXListing[] = [];

    console.log('📄 Document title:', doc.title);
    console.log('📄 Document body preview:', doc.body.innerHTML.substring(0, 1000));
    
    // Debug: Enhanced DOM structure analysis
    const allImages = doc.querySelectorAll('img');
    console.log('🖼️ Total images found in document:', allImages.length);
    
    // Log sample of images with more context
    allImages.forEach((img, i) => {
      if (i < 5) { // Log first 5 images with parent context
        console.log(`🖼️ Image ${i + 1}:`, {
          src: img.src,
          dataSrc: img.dataset.src,
          srcset: img.srcset,
          className: img.className,
          alt: img.alt,
          parentClassName: img.parentElement?.className,
          grandParentClassName: img.parentElement?.parentElement?.className
        });
      }
    });

    // Target actual OLX listing cards, not advertising placeholders
    const possibleSelectors = [
      // Primary OLX Brazil selectors - target the actual listing cards
      '.olx-adcard',                    // Main listing card container
      '.olx-adcard__content',           // Content area of listing card
      // Data-testid based selectors
      '[data-testid*="ad-card"]',
      '[data-testid*="listing"]',
      // Generic fallbacks
      '[class*="adcard"]:not([class*="advertising"]):not([class*="placeholder"])',
      'a[href*="olx.com.br/"][href*="/item/"]',
      'a[href*="olx.com.br/"][href*="/anuncio/"]'
    ];

    let listingElements: NodeListOf<Element> | null = null;
    let usedSelector = '';

    // Try each selector until we find listings
    for (const selector of possibleSelectors) {
      const elements = doc.querySelectorAll(selector);
      console.log(`🎯 Selector "${selector}" found ${elements.length} elements`);
      if (elements.length > 0) {
        listingElements = elements;
        usedSelector = selector;
        break;
      }
    }

    if (!listingElements || listingElements.length === 0) {
      console.log('❌ No listing elements found with any selector, using mock data');
      console.log('📄 Available elements sample:', doc.body.querySelectorAll('*').length, 'total elements');
      // Log some class names to help debug
      const elementsWithClasses = Array.from(doc.body.querySelectorAll('[class]')).slice(0, 20);
      console.log('📄 Sample elements with classes:', elementsWithClasses.map(el => el.className));
      return this.getMockData(url);
    }

    console.log(`✅ Using selector "${usedSelector}" with ${listingElements.length} elements`);

    listingElements.forEach((element, index) => {
      console.log(`🔍 Processing element ${index + 1}/${listingElements!.length}`);
      const listing = this.extractListingFromElement(element, index, url);
      if (listing) {
        listings.push(listing);
        console.log(`✅ Successfully extracted listing ${index + 1}:`, listing.title);
      } else {
        console.log(`❌ Failed to extract listing from element ${index + 1}`);
      }
    });

    console.log(`🎯 Final extraction result: ${listings.length} listings extracted`);
    return listings;
  }

  private static extractListingFromElement(element: Element, index: number, baseUrl: string): OLXListing | null {
    console.log(`🔍 Extracting element ${index + 1}:`, element.tagName, element.className);
    console.log(`🔍 Element HTML sample:`, element.innerHTML.substring(0, 500));
    
    // Try multiple selectors for title
    const titleSelectors = [
      '.olx-adcard__title',
      '[data-testid="ad-title"]',
      '.sc-heading',
      'h2', 'h3', 'h4',
      '.title', '.listing-title',
      '[class*="title"]'
    ];
    
    let title = '';
    for (const selector of titleSelectors) {
      const titleElement = element.querySelector(selector);
      if (titleElement?.textContent?.trim()) {
        title = titleElement.textContent.trim();
        console.log(`📝 Title found with "${selector}":`, title);
        break;
      }
    }
    
    // Try multiple selectors for price
    const priceSelectors = [
      '.olx-adcard__price',
      '[data-testid="ad-price"]',
      '.sc-price',
      '.price', '.listing-price',
      '[class*="price"]'
    ];
    
    let price = '';
    for (const selector of priceSelectors) {
      const priceElement = element.querySelector(selector);
      if (priceElement?.textContent?.trim()) {
        price = priceElement.textContent.trim();
        console.log(`💰 Price found with "${selector}":`, price);
        break;
      }
    }
    
    // Try multiple selectors for location
    const locationSelectors = [
      '.olx-adcard__location',
      '[data-testid="ad-location"]', 
      '.sc-location',
      '.location', '.listing-location',
      '[class*="location"]'
    ];
    
    let rawLocation = '';
    for (const selector of locationSelectors) {
      const locationElement = element.querySelector(selector);
      if (locationElement?.textContent?.trim()) {
        rawLocation = locationElement.textContent.trim();
        console.log(`📍 Location found with "${selector}":`, rawLocation);
        break;
      }
    }
    
    // Clean location text
    let location = rawLocation.replace(/^[^a-zA-Z]*/, '').trim();
    console.log(`📍 Cleaned location:`, location);
    
    // Try multiple selectors for date
    const dateSelectors = [
      '.olx-adcard__date',
      '[data-testid="ad-date"]',
      '.sc-date',
      '.date', '.listing-date',
      '[class*="date"]',
      '.olx-adcard__footer'
    ];
    
    let date = '';
    for (const selector of dateSelectors) {
      const dateElement = element.querySelector(selector);
      if (dateElement?.textContent?.trim()) {
        date = dateElement.textContent.trim();
        console.log(`📅 Date found with "${selector}":`, date);
        break;
      }
    }
    
    // Extract additional property details from description/title
    const fullText = `${title} ${element.textContent || ''}`.toLowerCase();
    
    // Extract square meters
    let squareMeters = '';
    const sqmPatterns = [
      /(\d+)\s*m²/i,
      /(\d+)\s*metros?\s*quadrados?/i,
      /(\d+)\s*m2/i,
      /área:\s*(\d+)/i
    ];
    
    for (const pattern of sqmPatterns) {
      const match = fullText.match(pattern);
      if (match) {
        squareMeters = `${match[1]}m²`;
        console.log(`📐 Square meters found:`, squareMeters);
        break;
      }
    }
    
    // Extract bedrooms
    let bedrooms = '';
    const bedroomPatterns = [
      /(\d+)\s*quartos?/i,
      /(\d+)\s*dormitórios?/i,
      /(\d+)\s*quartos?\s*dormitórios?/i
    ];
    
    for (const pattern of bedroomPatterns) {
      const match = fullText.match(pattern);
      if (match) {
        bedrooms = `${match[1]} quartos`;
        console.log(`🛏️ Bedrooms found:`, bedrooms);
        break;
      }
    }
    
    // Extract description from dedicated selectors
    const descriptionSelectors = [
      '.olx-adcard__description',
      '[data-testid="ad-description"]',
      '.sc-description',
      '.description'
    ];
    
    let description = title;
    for (const selector of descriptionSelectors) {
      const descElement = element.querySelector(selector);
      if (descElement?.textContent?.trim()) {
        description = descElement.textContent.trim();
        console.log(`📋 Description found with "${selector}":`, description.substring(0, 100));
        break;
      }
    }
    
    // Try multiple selectors for link
    const linkSelectors = [
      'a[data-testid="adcard-link"]',
      'a[data-testid="ad-link"]',
      'a[href*="/anuncio/"]',
      'a[href*="/item/"]',
      'a[href]'
    ];
    
    let fullLink = '';
    for (const selector of linkSelectors) {
      const linkElement = element.querySelector(selector) as HTMLAnchorElement;
      if (linkElement?.href) {
        const relativeLink = linkElement.href;
        fullLink = relativeLink.startsWith('http') ? relativeLink : new URL(relativeLink, baseUrl).href;
        console.log(`🔗 Link found with "${selector}":`, fullLink);
        break;
      }
    }

    // Enhanced image extraction with broader DOM context search
    let imageSrc = this.getPlaceholderImage(index);
    
    console.log(`🔍 Starting enhanced image extraction for element ${index + 1}`);
    
    // Strategy 1: Look within the current element (traditional approach)
    imageSrc = this.findImageInElement(element, index) || imageSrc;
    
    // Strategy 2: Look in parent/sibling elements if no image found
    if (imageSrc.includes('placeholder') || imageSrc.includes('unsplash')) {
      console.log(`🔍 Expanding search to parent/sibling elements for element ${index + 1}`);
      
      // Check parent element
      if (element.parentElement) {
        const parentImage = this.findImageInElement(element.parentElement, index);
        if (parentImage && (!parentImage.includes('placeholder') && !parentImage.includes('unsplash'))) {
          imageSrc = parentImage;
          console.log(`✅ Found image in parent element for ${index + 1}:`, imageSrc);
        }
      }
      
      // Check preceding sibling (image might be before text content)
      if (imageSrc.includes('placeholder') || imageSrc.includes('unsplash')) {
        const prevSibling = element.previousElementSibling;
        if (prevSibling) {
          const siblingImage = this.findImageInElement(prevSibling, index);
          if (siblingImage && (!siblingImage.includes('placeholder') && !siblingImage.includes('unsplash'))) {
            imageSrc = siblingImage;
            console.log(`✅ Found image in previous sibling for ${index + 1}:`, imageSrc);
          }
        }
      }
      
      // Check following sibling (image might be after text content)
      if (imageSrc.includes('placeholder') || imageSrc.includes('unsplash')) {
        const nextSibling = element.nextElementSibling;
        if (nextSibling) {
          const siblingImage = this.findImageInElement(nextSibling, index);
          if (siblingImage && (!siblingImage.includes('placeholder') && !siblingImage.includes('unsplash'))) {
            imageSrc = siblingImage;
            console.log(`✅ Found image in next sibling for ${index + 1}:`, imageSrc);
          }
        }
      }
    }
    
    console.log(`🖼️ Final image for element ${index + 1}:`, imageSrc);

    console.log(`📋 Element ${index + 1} extracted data:`, { 
      title, price, location, date, link: fullLink, image: imageSrc, 
      squareMeters, bedrooms 
    });

    if (!title && !price) {
      console.log(`❌ Element ${index + 1} rejected: missing both title and price`);
      return null;
    }

    // Parse Portuguese date properly
    const parsedDate = date ? this.parsePortugueseDate(date) : new Date().toISOString().split('T')[0];
    console.log(`📅 Date parsing: "${date}" -> "${parsedDate}"`);

    return {
      id: `olx-${index}-${Date.now()}`,
      title: title || 'Untitled',
      price: price || 'Price not available',
      location: location || 'Location not available',
      images: [imageSrc],
      link: fullLink,
      description,
      postedDate: parsedDate,
      // Add custom fields for additional details
      category: 'imovel',
      ...(squareMeters && { squareMeters }),
      ...(bedrooms && { bedrooms })
    };
  }

  private static parsePortugueseDate(dateText: string): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Clean the date text
    const cleanText = dateText.toLowerCase().trim();
    
    // Handle relative dates
    if (cleanText.includes('hoje')) {
      return today.toISOString().split('T')[0];
    }
    
    if (cleanText.includes('ontem')) {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return yesterday.toISOString().split('T')[0];
    }
    
    // Handle absolute dates like "3 de jul, 11:39" or "15 de dezembro"
    const monthMap: { [key: string]: number } = {
      'jan': 0, 'janeiro': 0,
      'fev': 1, 'fevereiro': 1,
      'mar': 2, 'março': 2,
      'abr': 3, 'abril': 3,
      'mai': 4, 'maio': 4,
      'jun': 5, 'junho': 5,
      'jul': 6, 'julho': 6,
      'ago': 7, 'agosto': 7,
      'set': 8, 'setembro': 8,
      'out': 9, 'outubro': 9,
      'nov': 10, 'novembro': 10,
      'dez': 11, 'dezembro': 11
    };
    
    // Try to match patterns like "3 de jul" or "15 de dezembro"
    const datePattern = /(\d{1,2})\s+de\s+(\w+)/i;
    const match = cleanText.match(datePattern);
    
    if (match) {
      const day = parseInt(match[1]);
      const monthName = match[2].toLowerCase();
      const monthIndex = monthMap[monthName];
      
      if (monthIndex !== undefined && day >= 1 && day <= 31) {
        const year = now.getFullYear();
        const parsedDate = new Date(year, monthIndex, day);
        
        // If the date is in the future, assume it's from last year
        if (parsedDate > now) {
          parsedDate.setFullYear(year - 1);
        }
        
        return parsedDate.toISOString().split('T')[0];
      }
    }
    
    // Fallback to today's date for unrecognized formats
    return today.toISOString().split('T')[0];
  }

  private static getMockData(url: string): OLXListing[] {
    // Mock data based on the URL domain for demonstration
    const domain = new URL(url).hostname;
    const isBrazil = domain.includes('.br');
    
    return [
      {
        id: 'mock-1',
        title: isBrazil ? 'Terreno em Santa Catarina - 1000m²' : 'Modern Apartment - City Center',
        price: isBrazil ? 'R$ 180.000' : '850.000 PLN',
        location: isBrazil ? 'Imbituba, Santa Catarina' : 'Warsaw, Centrum',
        images: [this.getPlaceholderImage(0)],
        link: url,
        description: isBrazil ? 'Excelente terreno para construção' : 'Beautiful apartment with great views',
        postedDate: '2024-01-15',
        squareMeters: '1000m²',
        bedrooms: '3 quartos'
      },
      {
        id: 'mock-2',
        title: isBrazil ? 'Casa próxima ao mar - 3 quartos' : 'Gaming Laptop - RTX 4070',
        price: isBrazil ? 'R$ 450.000' : '4.500 PLN',
        location: isBrazil ? 'Garopaba, Santa Catarina' : 'Krakow, Stare Miasto',
        images: [this.getPlaceholderImage(1)],
        link: url,
        description: isBrazil ? 'Casa com vista para o mar' : 'High-performance gaming laptop',
        postedDate: '2024-01-14',
        squareMeters: '150m²',
        bedrooms: '3 quartos'
      },
      {
        id: 'mock-3',
        title: isBrazil ? 'Lote comercial - Centro da cidade' : 'Vintage Bicycle - Excellent Condition',
        price: isBrazil ? 'R$ 320.000' : '1.200 PLN',
        location: isBrazil ? 'Tubarão, Santa Catarina' : 'Gdansk, Centrum',
        images: [this.getPlaceholderImage(2)],
        link: url,
        description: isBrazil ? 'Ótima localização comercial' : 'Classic city bike in great shape',
        postedDate: '2024-01-13',
        squareMeters: '500m²'
      }
    ];
  }

  // Get rotating placeholder images for better visual variety
  private static getPlaceholderImage(index: number): string {
    const placeholders = [
      'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
      'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b', 
      'https://images.unsplash.com/photo-1518770660439-4636190af475',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
      'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d'
    ];
    return placeholders[index % placeholders.length];
  }

  // Enhanced image finding within an element
  private static findImageInElement(element: Element, index: number): string | null {
    const imageSelectors = [
      // OLX-specific selectors (high priority)
      'img[data-testid*="ad-image"]',
      'img[data-testid*="listing-image"]',
      'img[src*="olx"]',
      'img[data-src*="olx"]',
      // Lazy loading patterns
      'img[data-src]',
      'img[data-original]',
      'img[data-lazy]',
      'img[srcset]',
      // Generic image selectors
      'img[src]:not([src=""]):not([src="/placeholder.svg"])',
      'img'
    ];

    for (const selector of imageSelectors) {
      const images = element.querySelectorAll(selector);
      
      for (const img of images) {
        const imageEl = img as HTMLImageElement;
        
        // Get potential image sources in order of preference
        const potentialSources = [
          imageEl.dataset.src,
          imageEl.dataset.original,
          imageEl.dataset.lazy,
          imageEl.srcset?.split(',')[0]?.split(' ')[0],
          imageEl.src
        ].filter(Boolean);
        
        for (const src of potentialSources) {
          if (src && this.isValidImageUrl(src)) {
            // Clean and return the URL
            let cleanSrc = src.trim();
            if (cleanSrc.startsWith('//')) {
              cleanSrc = 'https:' + cleanSrc;
            }
            console.log(`✅ Found valid image in element:`, cleanSrc);
            return cleanSrc;
          }
        }
      }
    }
    
    return null;
  }

  // Validate if URL is a real image source
  private static isValidImageUrl(url: string): boolean {
    return url !== '/placeholder.svg' && 
           !url.includes('data:image') && 
           !url.includes('svg+xml') &&
           !url.includes('blank.gif') &&
           !url.includes('pixel.gif') &&
           !url.includes('placeholder') &&
           (url.includes('olx') || url.includes('http') || url.startsWith('//'));
  }
}