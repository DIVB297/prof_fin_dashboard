// Google Finance scraping implementation
// Only Yahoo Finance + Google Finance scraping (all other APIs removed)

import axios from 'axios';
import * as cheerio from 'cheerio';

export interface GoogleFinanceMetrics {
  symbol: string;
  peRatio?: number;
  marketCap?: string;
  marketCapNumber?: number;
  revenue?: string;
  netIncome?: string;
  eps?: number;
  dividendYield?: number;
  bookValue?: number;
  beta?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  error?: string;
  dataSource: 'google';
  scrapedAt?: string;
}

export interface GoogleEarningsData {
  symbol: string;
  nextEarningsDate?: string;
  lastEarningsDate?: string;
  estimatedEPS?: number;
  actualEPS?: number;
  earningsTime?: string;
  error?: string;
}

/**
 * Handle special symbol cases that need different formatting
 */
function getSymbolVariations(symbol: string): string[] {
  const variations = [symbol];
  
  // Handle symbols with hyphens (like BRK-B)
  if (symbol.includes('-')) {
    variations.push(symbol.replace('-', '.'));  // BRK-B -> BRK.B
    variations.push(symbol.replace('-', '_'));  // BRK-B -> BRK_B
  }
  
  // Handle symbols with dots (like BRK.A)
  if (symbol.includes('.')) {
    variations.push(symbol.replace('.', '-'));  // BRK.A -> BRK-A
    variations.push(symbol.replace('.', '_'));  // BRK.A -> BRK_A
  }
  
  return variations;
}

/**
 * Scrape Google Finance directly for comprehensive financial data
 * Multiple strategies to handle different Google Finance layouts
 */
export async function scrapeGoogleFinance(symbol: string): Promise<GoogleFinanceMetrics> {
  try {
    console.log(`Scraping Google Finance for ${symbol}...`);
    
    // Get symbol variations for special cases
    const symbolVariations = getSymbolVariations(symbol);
    const urls: string[] = [];
    
    // Build URLs for all symbol variations and exchanges
    for (const symVar of symbolVariations) {
      const encoded = encodeURIComponent(symVar);
      
      urls.push(
        `https://www.google.com/finance/quote/${encoded}:NASDAQ`,
        `https://www.google.com/finance/quote/${encoded}:NYSE`,
        `https://www.google.com/finance/quote/${encoded}`,
        `https://www.google.com/finance/quote/${symVar}:NASDAQ`,
        `https://www.google.com/finance/quote/${symVar}:NYSE`, 
        `https://www.google.com/finance/quote/${symVar}`
      );
    }
    
    console.log(`Trying ${urls.length} URL variations for ${symbol}`);
    let lastError: any = null;

    for (const url of urls) {
      try {
        console.log(`Trying URL: ${url}`);
        const result = await scrapeGoogleFinanceUrl(url, symbol);
        
        if (result && !result.error) {
          console.log(`Successfully scraped ${symbol} from Google Finance`);
          return result;
        }
        
        if (result?.error) {
          lastError = result.error;
        }
      } catch (error) {
        console.log(`Failed to scrape ${url}:`, error);
        lastError = error;
      }
    }

    // If all URLs failed, return error result
    console.log(`All Google Finance URLs failed for ${symbol}`);
    return {
      symbol,
      dataSource: 'google',
      scrapedAt: new Date().toISOString(),
      error: `Google Finance scraping failed: ${lastError instanceof Error ? lastError.message : 'Unknown error'}`,
    };

  } catch (error) {
    console.error(`Error scraping Google Finance for ${symbol}:`, error);
    return {
      symbol,
      dataSource: 'google',
      scrapedAt: new Date().toISOString(),
      error: `Scraping error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Scrape a specific Google Finance URL
 */
async function scrapeGoogleFinanceUrl(url: string, symbol: string): Promise<GoogleFinanceMetrics> {
  // Rotate user agents to avoid detection
  const userAgents = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ];
  
  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  
  const response = await axios.get(url, {
    headers: {
      'User-Agent': randomUserAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'cross-site',
      'Sec-Fetch-User': '?1',
      'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"macOS"',
      'Upgrade-Insecure-Requests': '1',
      'Referer': 'https://www.google.com/',
    },
    timeout: 20000, // Increased timeout
    maxRedirects: 10,
    validateStatus: (status) => status < 400, // Accept redirects
  });

  if (response.status !== 200) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const $ = cheerio.load(response.data);
  
  // Initialize result object
  const result: GoogleFinanceMetrics = {
    symbol,
    dataSource: 'google',
    scrapedAt: new Date().toISOString(),
  };

  // Check if we're getting blocked or redirected
  if (response.data.includes('detected unusual traffic') || 
      response.data.includes('captcha') || 
      response.data.includes('blocked') ||
      response.data.length < 1000) {
    console.log(`Possible anti-bot detection for ${symbol}`);
    throw new Error('Possible anti-bot measures detected');
  }

  // Multiple selectors for P/E ratio (Google changes these frequently)
  const peSelectors = [
    // Modern Google Finance selectors
    '[data-test-id="PE ratio"] .P6K39c',
    '[jsname="Vebqub"]:contains("P/E ratio") + div',
    '.gyFHrc:contains("P/E ratio") .P6K39c',
    '.mfs7Fc:contains("P/E ratio") + .P6K39c',
    
    // More specific selectors
    'div[data-test-id*="PE"] .P6K39c',
    'div[jsname*="ratio"] .P6K39c',
    
    // Fallback selectors
    'div:contains("P/E ratio") .P6K39c',
    'div:contains("PE ratio") .P6K39c',
    'span:contains("P/E"):parent .P6K39c',
    '.P6K39c:contains("P/E")',
    '[aria-label*="P/E"] .P6K39c',
    
    // Text-based fallbacks
    'div:contains("P/E")',
    'span:contains("P/E")',
    
    // Legacy selectors
    '.gyFHrc .P6K39c',
    '.mfs7Fc .P6K39c',
  ];

  // Try to extract P/E ratio with more robust logic
  for (const selector of peSelectors) {
    try {
      const elements = $(selector);
      
      elements.each((_, element) => {
        let text = $(element).text().trim();
        
        // Skip if we already found a P/E ratio
        if (result.peRatio) return;
        
        // If this element contains P/E text, look for numbers nearby
        if (text.toLowerCase().includes('p/e') || text.toLowerCase().includes('pe ratio')) {
          console.log(`PE Context "${selector}" found: "${text}"`);
          
          // Look in sibling elements for the actual number
          const parent = $(element).parent();
          const siblings = parent.find('*');
          
          siblings.each((_, sibling) => {
            const siblingText = $(sibling).text().trim();
            const peMatch = siblingText.match(/^(\d+\.?\d*)$/);
            
            if (peMatch && !result.peRatio) {
              const peValue = parseFloat(peMatch[1]);
              if (peValue > 0 && peValue < 1000) {
                result.peRatio = peValue;
                console.log(`Found P/E ratio in sibling: ${peValue}`);
                return false; // Break the loop
              }
            }
          });
        }
        
        // Direct number extraction from the text
        const peMatch = text.match(/(\d+\.?\d*)/);
        if (peMatch && !result.peRatio) {
          const peValue = parseFloat(peMatch[1]);
          
          // More lenient validation - if this selector specifically targets P/E
          const isPESelector = selector.toLowerCase().includes('pe') || 
                              selector.toLowerCase().includes('ratio') ||
                              text.toLowerCase().includes('p/e');
          
          if (isPESelector && peValue > 0 && peValue < 1000) {
            result.peRatio = peValue;
            console.log(`Found P/E ratio: ${peValue} from selector: ${selector}`);
          } else if (peValue > 5 && peValue < 200) { // More conservative range for generic selectors
            console.log(`Potential P/E ratio: ${peValue} from "${text}" (selector: ${selector})`);
          }
        }
      });
      
      if (result.peRatio) break;
    } catch (error) {
      console.log(`Error with PE selector "${selector}":`, error);
    }
  }

  // Extract Market Cap
  const marketCapSelectors = [
    '[data-test-id="Market cap"] .P6K39c',
    '.gyFHrc:contains("Market cap") .P6K39c',
    'div:contains("Market cap") .P6K39c',
    '.mfs7Fc:contains("Market cap") + .P6K39c',
  ];

  for (const selector of marketCapSelectors) {
    try {
      const element = $(selector).first();
      if (element.length) {
        const text = element.text().trim();
        console.log(`Market Cap found: "${text}"`);
        
        if (text && text.match(/[0-9]/)) {
          result.marketCap = text;
          
          // Convert to number if possible
          const numMatch = text.match(/([\d.]+)([KMBT]?)/);
          if (numMatch) {
            let num = parseFloat(numMatch[1]);
            const unit = numMatch[2];
            
            switch (unit) {
              case 'K': num *= 1000; break;
              case 'M': num *= 1000000; break;
              case 'B': num *= 1000000000; break;
              case 'T': num *= 1000000000000; break;
            }
            
            result.marketCapNumber = num;
          }
          break;
        }
      }
    } catch (error) {
      console.log(`Error with market cap selector "${selector}":`, error);
    }
  }

  // Extract other financial metrics
  const extractMetric = (label: string, selectors: string[]) => {
    for (const selector of selectors) {
      try {
        const element = $(selector.replace('{LABEL}', label)).first();
        if (element.length) {
          const text = element.text().trim();
          console.log(`${label} found: "${text}"`);
          return text;
        }
      } catch (error) {
        console.log(`Error extracting ${label}:`, error);
      }
    }
    return null;
  };

  const metricSelectors = [
    '[data-test-id="{LABEL}"] .P6K39c',
    '.gyFHrc:contains("{LABEL}") .P6K39c',
    'div:contains("{LABEL}") .P6K39c',
  ];

  // Extract EPS
  const epsText = extractMetric('EPS', metricSelectors);
  if (epsText) {
    const epsMatch = epsText.match(/([\d.-]+)/);
    if (epsMatch) {
      result.eps = parseFloat(epsMatch[1]);
    }
  }

  // Extract Dividend Yield
  const divYieldText = extractMetric('Div yield', metricSelectors) || extractMetric('Dividend yield', metricSelectors);
  if (divYieldText) {
    const divMatch = divYieldText.match(/([\d.]+)%/);
    if (divMatch) {
      result.dividendYield = parseFloat(divMatch[1]);
    }
  }

  // Extract Revenue
  result.revenue = extractMetric('Revenue', metricSelectors) || undefined;

  // Extract Net Income  
  result.netIncome = extractMetric('Net income', metricSelectors) || undefined;

  // Extract Beta
  const betaText = extractMetric('Beta', metricSelectors);
  if (betaText) {
    const betaMatch = betaText.match(/([\d.-]+)/);
    if (betaMatch) {
      result.beta = parseFloat(betaMatch[1]);
    }
  }

  // Try to get 52-week high/low from the page
  try {
    const weekRangeText = $('div:contains("52-week") .P6K39c, div:contains("52 week") .P6K39c').first().text();
    if (weekRangeText) {
      console.log(`52-week range: "${weekRangeText}"`);
      const rangeMatch = weekRangeText.match(/([\d.]+)\s*-\s*([\d.]+)/);
      if (rangeMatch) {
        result.fiftyTwoWeekLow = parseFloat(rangeMatch[1]);
        result.fiftyTwoWeekHigh = parseFloat(rangeMatch[2]);
      }
    }
  } catch (error) {
    console.log('Error extracting 52-week range:', error);
  }

  // If we still don't have P/E ratio, try a broader search
  if (!result.peRatio) {
    console.log(`🔍 Trying broader P/E search for ${symbol}...`);
    
    // Look for any text containing "P/E" and numbers nearby
    const allText = $('body').text();
    const peMatches = allText.match(/P\/E[:\s]*(\d+\.?\d*)/gi) || 
                     allText.match(/PE[:\s]*(\d+\.?\d*)/gi) ||
                     allText.match(/ratio[:\s]*(\d+\.?\d*)/gi);
    
    if (peMatches && peMatches.length > 0) {
      for (const match of peMatches) {
        const numMatch = match.match(/(\d+\.?\d*)/);
        if (numMatch) {
          const peValue = parseFloat(numMatch[1]);
          if (peValue > 5 && peValue < 200) {
            result.peRatio = peValue;
            console.log(`Found P/E ratio via broad search: ${peValue}`);
            break;
          }
        }
      }
    }
  }

  // Check if we got any meaningful data
  if (!result.peRatio && !result.marketCap && !result.eps) {
    console.log(`No meaningful data extracted for ${symbol}`);
    
    // Log more detailed debugging info
    const pageText = $('body').text().substring(0, 1000);
    console.log(`Page content preview: ${pageText}...`);
    
    // Check if page has finance-related content
    const hasFinanceContent = pageText.toLowerCase().includes('finance') ||
                             pageText.toLowerCase().includes('stock') ||
                             pageText.toLowerCase().includes('price') ||
                             pageText.toLowerCase().includes('market');
    
    if (!hasFinanceContent) {
      throw new Error('Page does not appear to contain financial data - possible redirect or blocking');
    } else {
      throw new Error('Financial data structure not recognized - possible layout change');
    }
  }

  console.log(`Successfully extracted data for ${symbol}:`, result);
  return result;
}

/**
 * Get earnings data from Google Search
 */
export async function scrapeGoogleEarnings(symbol: string): Promise<GoogleEarningsData> {
  try {
    console.log(`Scraping earnings data for ${symbol}...`);
    
    const searchQuery = `${symbol} earnings date 2025 next when`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const result: GoogleEarningsData = { symbol };

    // Look for earnings date in search results
    const searchResultsText = $('body').text();
    
    // Common earnings date patterns
    const datePatterns = [
      /earnings.*?(\w+ \d{1,2}, 202[4-5])/i,
      /(\w+ \d{1,2}, 202[4-5]).*?earnings/i,
      /reports.*?(\w+ \d{1,2}, 202[4-5])/i,
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w* \d{1,2}, 202[4-5]/g,
    ];

    for (const pattern of datePatterns) {
      const match = searchResultsText.match(pattern);
      if (match) {
        result.nextEarningsDate = match[1] || match[0];
        console.log(`Found earnings date: ${result.nextEarningsDate}`);
        break;
      }
    }

    // Look for EPS estimates
    const epsPattern = /EPS.*?\$([\d.]+)/i;
    const epsMatch = searchResultsText.match(epsPattern);
    if (epsMatch) {
      result.estimatedEPS = parseFloat(epsMatch[1]);
    }

    return result;

  } catch (error) {
    console.error(`Error scraping earnings for ${symbol}:`, error);
    return {
      symbol,
      error: `Earnings scraping error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}



/**
 * Batch scrape Google Finance for multiple symbols in parallel
 */
export async function batchScrapeGoogleFinance(symbols: string[]): Promise<GoogleFinanceMetrics[]> {
  console.log(`🚀 Starting parallel batch scraping for ${symbols.length} symbols...`);
  
  // Create an array of promises for parallel execution
  const scrapePromises = symbols.map(async (symbol, index) => {
    try {
      console.log(`Starting scrape for ${symbol} (${index + 1}/${symbols.length})`);
      
      // Add a small random delay to avoid hitting the server all at once
      const randomDelay = Math.random() * 1000; // 0-1 second random delay
      await new Promise(resolve => setTimeout(resolve, randomDelay));
      
      const data = await scrapeGoogleFinance(symbol);
      console.log(`Completed scraping ${symbol}`);
      return data;
      
    } catch (error) {
      console.error(`Failed to scrape ${symbol}:`, error);
      
      // Return error result for failed symbols
      return {
        symbol,
        dataSource: 'google' as const,
        scrapedAt: new Date().toISOString(),
        error: `Scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  });
  
  // Execute all scraping operations in parallel
  console.log(`Executing ${scrapePromises.length} parallel requests...`);
  const results = await Promise.all(scrapePromises);
  
  // Log results summary
  const successful = results.filter(r => !r.error).length;
  const failed = results.filter(r => r.error).length;
  
  console.log(`Parallel batch scraping completed!`);
  console.log(`Successful: ${successful}/${symbols.length}`);
  console.log(`Failed: ${failed}/${symbols.length}`);

  return results;
}

// Legacy exports for compatibility
export const getBatchFinancialMetrics = batchScrapeGoogleFinance;
export const getFinancialMetrics = scrapeGoogleFinance;
export type FinancialMetrics = GoogleFinanceMetrics;
