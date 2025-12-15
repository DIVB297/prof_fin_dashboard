# Professional Finance Dashboard

A modern financial dashboard built with Next.js that provides real-time stock data, P/E ratios, and market analytics.

## Features

- **Real-time Stock Data**: Live pricing and market information
- **P/E Ratios & Metrics**: Enhanced financial metrics from multiple sources
- **Interactive Data Grid**: Advanced sorting, filtering, and grouping capabilities
- **Combined Data Sources**: Always fetches Yahoo Finance data enhanced with Google Finance P/E ratios and metrics
- **Modern UI**: Clean, responsive design with real-time updates

## Asumptions
Purcahse Price and Quantity are hardcoded with fixed values (As its not user specific)
Quantity is picked from random number from 1, 2, or 3 to show the dynamic updates in the table without refreshing
(As market will open only from 9:30 Am to 4:00 pm so this is done to show how auto updates are done)

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

## Setup Instructions

1. **Clone the github repositry**
   ```
      git clone https://github.com/DIVB297/prof_fin_dashboard.git
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

- **Combined Data**: Automatically fetches Yahoo Finance data enhanced with Google Finance P/E ratios and metrics
- **Data Controls**: Use the grid controls to sort, filter, and group stocks  
- **Real-time Updates**: Data refreshes automatically with live market information enhanced by Google Finance scraping
