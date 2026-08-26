import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { meetingId } = await request.json();
    if (!meetingId) {
      return NextResponse.json({ error: "meetingId required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: meeting } = await supabase
      .from("meetings")
      .select("*, clients(*), profiles(full_name, email:id)")
      .eq("id", meetingId)
      .single();

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const intelligence = meeting.intelligence as { followUpEmailDraft?: string } | null;
    if (!intelligence?.followUpEmailDraft) {
      return NextResponse.json(
        { error: "No follow-up draft available. Process transcript first." },
        { status: 400 }
      );
    }

    const client = meeting.clients as { full_name: string; email: string | null };

    if (!client.email) {
      return NextResponse.json({ error: "Client has no email address" }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json({ error: "Email delivery service not configured (RESEND_API_KEY missing)" }, { status: 500 });
    }

    const resend = new Resend(resendApiKey);

    // Send the email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@adviza.ai",
      to: client.email,
      subject: `Meeting Follow-up — ${new Date(meeting.scheduled_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
      text: intelligence.followUpEmailDraft,
      replyTo: user.email ?? undefined,
    });

    if (emailError) {
      throw new Error(emailError.message);
    }

    // Mark follow-up as sent
    const serviceClient = await createServiceClient();
    await serviceClient.from("meetings").update({ follow_up_sent: true }).eq("id", meetingId);

    // Audit log
    const { data: profile } = await supabase.from("profiles").select("firm_id").eq("id", user.id).single();
    if (profile) {
      await serviceClient.from("audit_logs").insert({
        firm_id: profile.firm_id,
        user_id: user.id,
        action: "send_follow_up_email",
        entity_type: "meeting",
        entity_id: meetingId,
        metadata: { to: client.email, email_id: emailData?.id },
      });
    }

    return NextResponse.json({ success: true, emailId: emailData?.id });
  } catch (error) {
    console.error("[follow-up-email]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
