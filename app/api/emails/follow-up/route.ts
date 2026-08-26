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
      return NextResponse.json({ error: "Client has no email address configured" }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json({ error: "Email delivery service not configured (RESEND_API_KEY missing)" }, { status: 500 });
    }

    const resend = new Resend(resendApiKey);
    const dateFormatted = new Date(meeting.scheduled_at).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px 24px; background-color: #FAF5F0; border-radius: 24px; color: #121217; border: 1px solid #EADBCE;">
        <div style="margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid #EADBCE; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 18px; font-weight: 800; color: #121217; letter-spacing: -0.5px;">Adviza<span style="color: #F43F5E;">.</span></span>
          <span style="font-size: 11px; font-family: monospace; color: #8E847C; text-transform: uppercase;">Meeting Summary</span>
        </div>
        <div style="background-color: #ffffff; padding: 24px; border-radius: 18px; border: 1px solid #EADBCE; white-space: pre-wrap; font-size: 14px; line-height: 1.65; color: #2D2721;">${intelligence.followUpEmailDraft.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
        <div style="margin-top: 24px; text-align: center; font-size: 12px; color: #8E847C;">
          Sent via Adviza AI Wealth Management Platform · Confirmed Fiduciary Record
        </div>
      </div>
    `;

    // Send the email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Adviza AI <onboarding@resend.dev>",
      to: client.email,
      subject: `Meeting Follow-up — ${dateFormatted}`,
      text: intelligence.followUpEmailDraft,
      html: htmlBody,
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
