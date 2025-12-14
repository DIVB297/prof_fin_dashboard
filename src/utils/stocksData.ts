import { fetchData } from "./apiService";

export async function getStockData(symbols: string[], includeGoogle = true){ // Always include Google Finance by default
    const response = await fetchData('/api/finance', {
        method: 'POST',
        body: JSON.stringify({ symbols, includeGoogle }),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response;
}

export async function getEnhancedStockData(symbols: string[]){
    return getStockData(symbols, true);
} 


// export async function getStaticStockData(){
//     const response = await fetchData('/api/finance-json');
//     return response;
// }