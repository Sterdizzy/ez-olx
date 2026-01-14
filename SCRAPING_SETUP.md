# OLX Scraping Setup

## Problem

OLX uses **Cloudflare protection** which blocks automated requests from servers. The error you're seeing (`403 Forbidden` with "Attention Required! | Cloudflare") means Cloudflare is detecting and blocking our proxy.

## Solutions

### Option 1: Use ScrapingBee (Recommended - Has Free Tier)

ScrapingBee bypasses Cloudflare and has a free tier with 1,000 requests/month.

1. Sign up at [https://www.scrapingbee.com/](https://www.scrapingbee.com/)
2. Get your API key from the dashboard
3. Add it to your environment variables:

**For local development:**
```bash
# Create a .env file in the root directory
echo "SCRAPINGBEE_API_KEY=your_api_key_here" > .env
```

**For Vercel deployment:**
```bash
vercel env add SCRAPINGBEE_API_KEY
# Enter your API key when prompted
```

Or add it in the Vercel dashboard:
- Go to your project settings
- Navigate to Environment Variables
- Add `SCRAPINGBEE_API_KEY` with your API key

4. Restart the dev server

### Option 2: Use ScraperAPI

Similar to ScrapingBee, also has a free tier (1,000 requests/month).

1. Sign up at [https://www.scraperapi.com/](https://www.scraperapi.com/)
2. Get your API key
3. Modify `api/proxy.ts` to use ScraperAPI instead

### Option 3: Browser Extension Approach (Client-Side Only)

Instead of server-side scraping, use a browser extension that bypasses CORS:
- Users install a CORS extension
- Frontend makes requests directly (no proxy)
- Not ideal for production but works for development

### Option 4: Find Alternative Data Source

Check if OLX has:
- An official API
- RSS feeds
- Mobile app API (easier to reverse engineer)

## Current Status

The proxy is set up and will automatically use ScrapingBee if the `SCRAPINGBEE_API_KEY` environment variable is set. Without it, direct requests will fail due to Cloudflare protection.

## Testing

After setting up the API key:
1. Restart your dev server
2. Try the search again
3. Check the console logs - you should see successful fetches
