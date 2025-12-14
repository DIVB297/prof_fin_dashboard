import { NextRequest, NextResponse } from "next/server";
import data from "../../../../data/enhancedDataLog.json";
export async function GET(request: NextRequest) {
    return NextResponse.json(
        { message: "Finance API is working!", data },
        { status: 200 }
    );
}