import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, firm_id, full_name")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.firm_id) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const serviceClient = await createServiceClient();

    // 1. Create Demo Clients
    const { data: client1, error: c1Err } = await serviceClient
      .from("clients")
      .insert({
        firm_id: profile.firm_id,
        advisor_id: user.id,
        full_name: "Alexander Vance",
        email: "alexander.vance@example.com",
        phone: "+1 (415) 555-0192",
        portfolio_value: 3850000,
        risk_tolerance: "aggressive",
        investment_goals: ["Venture Capital Allocation", "Tax Optimization", "Philanthropic Foundation"],
        notes: "Series B FinTech founder who recently completed a secondary tender offer ($2.1M liquidity). Wants to hedge concentrated tech equity exposure and reallocate into tax-exempt fixed income.",
      })
      .select()
      .single();

    if (c1Err && !client1) {
      console.error("[demo-seed] Client 1 insert error:", c1Err);
    }

    const { data: client2 } = await serviceClient
      .from("clients")
      .insert({
        firm_id: profile.firm_id,
        advisor_id: user.id,
        full_name: "Elena Rostova",
        email: "elena.rostova@example.com",
        phone: "+1 (212) 555-0188",
        portfolio_value: 2400000,
        risk_tolerance: "moderate",
        investment_goals: ["Estate Planning & Dynasty Trust", "Municipal Bonds", "Retirement Preservation"],
        notes: "Biotech VP planning sabbatical in 2027. Needs comprehensive cash flow modeling and trust restructuring.",
      })
      .select()
      .single();

    const targetClientId = client1?.id || client2?.id;

    if (!targetClientId) {
      return NextResponse.json({ error: "Failed to create demo clients" }, { status: 500 });
    }

    // 2. Create Demo Scheduled Meeting
    const scheduledDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(); // 2 days from now
    const { data: meeting, error: mErr } = await serviceClient
      .from("meetings")
      .insert({
        firm_id: profile.firm_id,
        client_id: targetClientId,
        advisor_id: user.id,
        title: "Q3 Strategic Portfolio Review & Tax Optimization",
        meeting_type: "review",
        scheduled_at: scheduledDate,
        status: "scheduled",
        transcript_text: null,
      })
      .select()
      .single();

    if (mErr) {
      console.error("[demo-seed] Meeting insert error:", mErr);
    }

    // 3. Create Sample Action Items
    if (meeting) {
      await serviceClient.from("action_items").insert([
        {
          firm_id: profile.firm_id,
          meeting_id: meeting.id,
          client_id: targetClientId,
          description: "Prepare 1031 exchange and municipal bond ladder proposal for Q3 liquidity",
          priority: "high",
          owner: "advisor",
          status: "open",
          due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString().slice(0, 10),
        },
        {
          firm_id: profile.firm_id,
          meeting_id: meeting.id,
          client_id: targetClientId,
          description: "Review beneficiary designations and irrevocable trust documents with legal counsel",
          priority: "medium",
          owner: "client",
          status: "open",
          due_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString().slice(0, 10),
        },
      ]);
    }

    return NextResponse.json({
      success: true,
      meetingId: meeting?.id,
      clientId: targetClientId,
      message: "Demo portfolio and meeting successfully created!",
    });
  } catch (error) {
    console.error("[demo-seed]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to seed demo data" },
      { status: 500 }
    );
  }
}
