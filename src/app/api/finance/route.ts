import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { batchScrapeGoogleFinance } from "@/utils/financialApis";
// import fs from 'fs'
import { transformData } from "@/utils/dataTransformation";
const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"], // optional
});

export async function GET(req: NextRequest) {
    return NextResponse.json(
        { message: "Finance API is working!" },
        { status: 200 }
    );
}

export async function POST(req: NextRequest) {
    try {
        const { symbols } = await req.json(); // Always include Google Finance data
        
        // Always get Yahoo Finance data (primary source)
        console.log('Fetching Yahoo Finance data for:', symbols);
        const yahooStockData = await Promise.all(symbols.map(async (symbol: string) => {
            try {
                const data = await yahooFinance.quote(symbol);
                return {
                    ...data,
                    dataSource: 'yahoo',
                    lastUpdated: new Date().toISOString(),
                };
            } catch (error) {
                console.error(`Yahoo Finance error for ${symbol}:`, error);
                return {
                    symbol,
                    error: `Yahoo Finance error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    dataSource: 'yahoo',
                    lastUpdated: new Date().toISOString(),
                };
            }
        }));

        // Always include enhanced financial data from Google Finance
        try {
            console.log('Scraping Google Finance for enhanced metrics:', symbols);
            
            // Use Google Finance scraping
            const googleMetrics = await batchScrapeGoogleFinance(symbols);
            
            // Create a map for easier lookup
            const metricsMap = new Map();
            googleMetrics.forEach((data: any) => {
                metricsMap.set(data.symbol, data);
            });
            
            // Enhance Yahoo data with Google Finance data
            let enhancedData = yahooStockData.map((yahoo: any) => {
                const googleData = metricsMap.get(yahoo.symbol);
                
                if (googleData && !googleData.error) {
                    return {
                            ...yahoo,
                            // Add Google Finance data
                            googlePeRatio: googleData.peRatio,
                            googleMarketCap: googleData.marketCap,
                            googleMarketCapNumber: googleData.marketCapNumber,
                            googleEps: googleData.eps,
                            googleDividendYield: googleData.dividendYield,
                            googleBookValue: googleData.bookValue,
                            googleRevenue: googleData.revenue,
                            googleNetIncome: googleData.netIncome,
                            googleBeta: googleData.beta,
                            google52WeekHigh: googleData.fiftyTwoWeekHigh,
                            google52WeekLow: googleData.fiftyTwoWeekLow,
                            dataSource: 'combined',
                            scrapedAt: googleData.scrapedAt,
                        };
                    }
                    
                    return {
                        ...yahoo,
                        googleError: googleData?.error,
                        dataSource: 'yahoo_only',
                    };
                });
                enhancedData = transformData(enhancedData);
                // fs.writeFileSync('data/enhancedDataLog.json', JSON.stringify(enhancedData, null, 2));
            return NextResponse.json(enhancedData);
        } catch (scrapeError) {
            console.error('Google Finance scraping batch error:', scrapeError);
            // Return Yahoo data with error info
            const dataWithScrapeError = yahooStockData.map((stock: any) => ({
                ...stock,
                googleError: `Google Finance scraping unavailable: ${scrapeError instanceof Error ? scrapeError.message : 'Unknown error'}`,
                dataSource: 'yahoo_only',
            }));
            return NextResponse.json(dataWithScrapeError);
        }
        
    } catch (err) {
        console.error('Finance API error:', err);
        return NextResponse.json(
            { error: "Failed to fetch stock data" },
            { status: 500 }
        );
    }
}