export const transformData = (data: any[]): any[] => {
  return data.map((item) => {
    // Calculate dynamic values first
    const purchasePrice = 500; // hardcoded values
    const quantityOptions = [1, 2, 3];
    const quantity = quantityOptions[Math.floor(Math.random() * quantityOptions.length)];
    const investment = purchasePrice * quantity;
    const cmp = item.regularMarketPrice || 0;
    const presentValue = cmp * quantity;
    const gainLoss = presentValue - investment;

    return {
      id: item.symbol,
    //   symbol: item.symbol,
      Particulars: item.longName,
      "Purchase Price": Number(purchasePrice.toFixed(2)),
      Quantity: quantity,
      "Investment": Number(investment.toFixed(2)),
      "Exchange Code": item.exchange,
      "CMP": Number(cmp.toFixed(2)),
      "Present Value": Number(presentValue.toFixed(2)),
      "Gain/Loss": Number(gainLoss.toFixed(2)),
      "P/E Ratio": item.googlePeRatio,
      "Latest Earnings": item.googleRevenue,
      "Net Income": item.googleNetIncome,
      "scrapedAt": item.scrapedAt,
    };
  });
};



// Particulars -> longName
// Purchase Price -> 
// Quantity -> 
// Exchange Code -> exchange
// CMP -> regularMarketPrice
// Present Value -> CMP * Quantity
// Gain/Loss -> Present Value - Investment
// P/E Ratio -> googlePeRatio
// Latest Earnings -> googleRevenue, googleNetIncome