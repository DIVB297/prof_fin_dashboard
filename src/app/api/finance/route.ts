import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
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
        const { symbols } = await req.json();
        const stockData = await Promise.all(symbols.map(async (symbol: string) => {
            const data = await yahooFinance.quote(symbol);
            console.log(data);
            return {
                ...data,
            };
        }));
        return NextResponse.json(stockData);
    } catch (err) {
        return NextResponse.json(
            { error: "Failed to fetch stock data" },
            { status: 500 }
        );
    }

}