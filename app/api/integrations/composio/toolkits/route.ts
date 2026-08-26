import { NextResponse } from "next/server";
import { fetchComposioToolkits } from "@/lib/composio";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "48", 10);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const data = await fetchComposioToolkits({
      page: isNaN(page) ? 1 : page,
      limit: isNaN(limit) ? 48 : limit,
      search,
      category,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Toolkits API route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load toolkits" },
      { status: 500 }
    );
  }
}
