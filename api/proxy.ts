import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Validate that it's an OLX URL for security
    const validDomains = ['olx.com.br', 'olx.pl', 'olx.pt', 'olx.com.pe', 'olx.com.ar'];
    const urlObj = new URL(url);
    const isValidDomain = validDomains.some(domain => urlObj.hostname.includes(domain));

    if (!isValidDomain) {
      return res.status(403).json({ error: 'Only OLX domains are allowed' });
    }

    console.log('Proxying request to:', url);

    // Try using ScrapingBee free tier (1000 requests/month free)
    // Alternative: Use direct fetch as fallback
    const useScrapingService = process.env.SCRAPINGBEE_API_KEY;

    let response: Response;

    if (useScrapingService) {
      // Use ScrapingBee to bypass Cloudflare
      const scrapingBeeUrl = `https://app.scrapingbee.com/api/v1/?api_key=${process.env.SCRAPINGBEE_API_KEY}&url=${encodeURIComponent(url)}&render_js=false`;
      response = await fetch(scrapingBeeUrl);
    } else {
      // Direct fetch with browser-like headers (will likely be blocked by Cloudflare)
      response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"macOS"',
          'Cache-Control': 'max-age=0',
          'Referer': 'https://www.olx.com.br/'
        },
        redirect: 'follow'
      });
    }

    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error response:', errorText.substring(0, 500));
      return res.status(response.status).json({
        error: `Failed to fetch: ${response.statusText}`,
        status: response.status,
        details: errorText.substring(0, 200)
      });
    }

    const html = await response.text();
    console.log(`Successfully fetched ${url}, HTML length: ${html.length}`);

    // Return the HTML content
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
