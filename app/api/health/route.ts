import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "Adviza",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
}
