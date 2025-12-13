import { fetchData } from "./apiService";

export async function getStockData(symbols: string[]){
    const response = await fetchData('/api/finance', {
        method: 'POST',
        body: JSON.stringify({ symbols }),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response;
} 