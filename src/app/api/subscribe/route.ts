import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminSupabase } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const OWNER_EMAIL = process.env.FORWARD_TO_EMAIL || "vanessa@nfebeauty.com";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const emailErrors = [];
    const dbErrors = [];

    // 1. Save to Database (Priority: High)
    // We use the Admin client to bypass RLS and ensure we can write to the table.
    let dbSuccess = false;
    try {
      const supabase = createAdminSupabase();
      const { error } = await supabase.from("subscribers").insert({ email });

      if (error) {
        // If it's a duplicate, we treat it as a "soft" success (user is already subscribed)
        if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('already exists')) {
          return NextResponse.json(
            { error: "This email is already subscribed." },
            { status: 409 }
          );
        }
        console.error("[subscribe] Database insert failed:", error);
        dbErrors.push(error.message);
      } else {
        dbSuccess = true;
      }
    } catch (dbError: any) {
      console.error("[subscribe] Database connection failed:", dbError);
      dbErrors.push(dbError.message);
    }

    // 2. Send Confirmation Email to Subscriber (Priority: High)
    if (dbSuccess && process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: "NFE Beauty <notifications@nfebeauty.com>",
          to: email,
          subject: "Welcome to NFE Beauty",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1B3A34;">Thank you for subscribing!</h2>
              <p>You've successfully joined the NFE Beauty community. You'll receive occasional, thoughtful notes on caring for mature melanated skin—plus behind-the-scenes updates as NFE evolves.</p>
              <p>No spam, no pressure. Just honest skin wisdom when I have something meaningful to share.</p>
              <p style="margin-top: 30px; color: #666; font-size: 14px;">With gratitude,<br>Vanessa<br>NFE Beauty</p>
            </div>
          `,
        });
      } catch (emailError: any) {
        console.error("[subscribe] Confirmation email send failed:", emailError);
        emailErrors.push(emailError.message);
      }
    }

    // 3. Send Email Notification to Owner (Priority: High)
    // We want to notify Vanessa immediately.
    if (dbSuccess && process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: "NFE Beauty <notifications@nfebeauty.com>",
          to: OWNER_EMAIL,
          subject: "New Newsletter Subscriber",
          html: `<p><strong>Email:</strong> ${email}</p><p><strong>Time:</strong> ${new Date().toISOString()}</p>`,
        });
      } catch (emailError: any) {
        console.error("[subscribe] Notification email send failed:", emailError);
        emailErrors.push(emailError.message);
      }
    } else if (!process.env.RESEND_API_KEY) {
      console.warn("[subscribe] RESEND_API_KEY missing");
    }

    // 4. AI Agent Forwarding (Priority: Low - Fire and Forget)
    if (process.env.FORWARD_TO_AI_URL) {
      fetch(process.env.FORWARD_TO_AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "subscribe", email }),
      }).catch((err) => console.error("[subscribe] AI forward failed:", err));
    }

    // Response Logic
    // If BOTH email and DB failed, we must report an error.
    // If at least one succeeded, we tell the user it worked (to be friendly), while logging the failure on our end.
    if (emailErrors.length > 0 && dbErrors.length > 0) {
      return NextResponse.json(
        { error: "System busy. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[subscribe] Critical route error:", error);
    // Return more specific error message if available
    const errorMessage = error?.message || "Server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
