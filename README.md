# Professional Finance Dashboard

A modern financial dashboard built with Next.js that provides real-time stock data, P/E ratios, and market analytics.

## Features

- **Real-time Stock Data**: Live pricing and market information
- **P/E Ratios & Metrics**: Enhanced financial metrics from multiple sources
- **Interactive Data Grid**: Advanced sorting, filtering, and grouping capabilities
- **Combined Data Sources**: Always fetches Yahoo Finance data enhanced with Google Finance P/E ratios and metrics
- **Modern UI**: Clean, responsive design with real-time updates

## Data Sources

- **Yahoo Finance**: Primary source for fast, reliable stock data
- **Google Finance**: Additional P/E ratios and financial metrics via web scraping

## Tech Stack

- **Framework**: Next.js 16.0.10 with React 19.2.1
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Grid**: AG Grid Enterprise
- **Financial APIs**: yahoo-finance2, custom Google Finance scraper
- **HTTP Client**: Axios with Cheerio for web scraping

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

- **Combined Data**: Automatically fetches Yahoo Finance data enhanced with Google Finance P/E ratios and metrics
- **Data Controls**: Use the grid controls to sort, filter, and group stocks  
- **Real-time Updates**: Data refreshes automatically with live market information enhanced by Google Finance scraping

## Project Structure

```
src/
├── app/
│   ├── api/finance/          # Main finance API endpoint
│   ├── globals.css           # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main dashboard page
├── components/
│   ├── AllStocks.tsx        # Main dashboard component with combined data display
│   └── GroupBy.tsx          # Data grouping controls
├── constants/
│   ├── columns.ts           # Grid column definitions
│   ├── dummy.ts             # Fallback data constants
│   └── symbols.ts           # Stock symbols list
└── utils/
    ├── apiService.ts        # API service layer
    ├── financialApis.ts     # Google Finance scraping
    ├── rowGroup.ts          # Data grouping utilities
    └── stocksData.ts        # Data processing utilities
```
