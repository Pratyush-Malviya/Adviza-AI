import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    creditsUsedToday: 24,
    dailyCreditLimit: 100,
    tokensUsedToday: 48500,
    promptsCountToday: 5,
    percentUsed: 24,
    activeModel: "claude-3-5-sonnet",
    resetAt: new Date(Date.now() + 86400000).toISOString(),
  });
}
