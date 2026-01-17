import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminSupabase } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_NOTIFICATION_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL || process.env.FORWARD_TO_EMAIL;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, ageRange, skinDescription, concerns, message } = body;

    const emailErrors = [];
    const dbErrors = [];

    // 1. Send Email Notification
    if (process.env.RESEND_API_KEY && ADMIN_NOTIFICATION_EMAIL) {
      try {
        await resend.emails.send({
          from: "NFE Beauty <notifications@nfebeauty.com>",
          to: ADMIN_NOTIFICATION_EMAIL,
          subject: "New Community Input Submission",
          html: `
            <h2>New Community Input</h2>
            <p><strong>Name:</strong> ${name || 'Not provided'}</p>
            <p><strong>Email:</strong> ${email || 'Not provided'}</p>
            <p><strong>Age Range:</strong> ${ageRange}</p>
            <p><strong>Skin Description:</strong> ${skinDescription}</p>
            <p><strong>Concerns:</strong> ${Array.isArray(concerns) ? concerns.join(', ') : concerns}</p>
            <p><strong>Message:</strong></p>
            <pre style="white-space: pre-wrap; font-family: sans-serif;">${message}</pre>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          `,
        });
      } catch (emailError: any) {
        console.error("[community-input] Email send failed:", emailError);
        emailErrors.push(emailError.message);
      }
    } else if (!process.env.RESEND_API_KEY) {
      console.error("[community-input] RESEND_API_KEY is missing - cannot send owner notification");
      emailErrors.push("Email service not configured");
    } else if (!ADMIN_NOTIFICATION_EMAIL) {
      console.error("[community-input] ADMIN_NOTIFICATION_EMAIL is missing - cannot send owner notification");
      emailErrors.push("Admin notification email not configured");
    }

    // 2. Save to Database
    try {
      const supabase = createAdminSupabase();
      const { error } = await supabase.from("community_input").insert({
        name,
        email,
        age_range: ageRange,
        skin_description: skinDescription,
        concerns, // Supabase handles array[] automatically if column is text[]
        message
      });

      if (error) {
        console.error("[community-input] Database insert failed:", error);
        dbErrors.push(error.message);
      }
    } catch (dbError: any) {
      console.error("[community-input] Database connection failed:", dbError);
      dbErrors.push(dbError.message);
    }

    // 3. AI Agent Forwarding
    if (process.env.FORWARD_TO_AI_URL) {
      fetch(process.env.FORWARD_TO_AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "community_input",
          data: body,
        }),
      }).catch((err) => console.error("AI forward failed:", err));
    }

    // Fail only if EVERYTHING failed. Community input is precious, so we try hard to save it.
    if (emailErrors.length > 0 && dbErrors.length > 0) {
      return NextResponse.json(
        { error: "Failed to submit feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Community Input API error:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
