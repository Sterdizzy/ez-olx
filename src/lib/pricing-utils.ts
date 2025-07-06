// Utility function to extract numeric price from Brazilian format
export const extractPriceNumber = (priceString: string): number => {
  try {
    // Handle null, undefined, or empty strings
    if (!priceString || typeof priceString !== 'string') {
      return 0;
    }

    // Handle common Brazilian price formats
    // Examples: "R$ 1.500,00", "R$1500", "1.500", "Consultar preço", etc.
    let cleanPrice = priceString.trim();
    
    // Return 0 for non-numeric prices like "Consultar preço", "A combinar", etc.
    if (!/\d/.test(cleanPrice)) {
      return 0;
    }
    
    // Remove currency symbols and extra spaces
    cleanPrice = cleanPrice.replace(/R\$?\s*/gi, '').trim();
    
    // Handle Brazilian number format: 1.500.000,50 -> 1500000.50
    if (cleanPrice.includes(',') && cleanPrice.includes('.')) {
      // If both comma and dot exist, dot is thousands separator, comma is decimal
      cleanPrice = cleanPrice.replace(/\./g, '').replace(',', '.');
    } else if (cleanPrice.includes(',')) {
      // Only comma exists, check if it's decimal separator or thousands
      const parts = cleanPrice.split(',');
      if (parts.length === 2 && parts[1].length <= 2) {
        // Comma is decimal separator: 1500,50 -> 1500.50
        cleanPrice = cleanPrice.replace(',', '.');
      } else {
        // Comma is thousands separator: 1,500 -> 1500
        cleanPrice = cleanPrice.replace(/,/g, '');
      }
    }
    
    const numericPrice = parseFloat(cleanPrice);
    return isNaN(numericPrice) ? 0 : Math.max(0, numericPrice);
  } catch (error) {
    console.warn('Price parsing error for value:', priceString, error);
    return 0;
  }
};