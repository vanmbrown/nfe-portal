import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminSupabase } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const emailErrors = [];
    const dbErrors = [];

    // 1. Send Email Notification (Priority: High)
    // We want to notify Vanessa immediately.
    if (process.env.FORWARD_TO_EMAIL && process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: "NFE Portal <notifications@nfebeauty.com>",
          to: process.env.FORWARD_TO_EMAIL,
          subject: "New Newsletter Subscriber",
          html: `<p><strong>Email:</strong> ${email}</p><p><strong>Time:</strong> ${new Date().toISOString()}</p>`,
        });
      } catch (emailError: any) {
        console.error("[subscribe] Email send failed:", emailError);
        emailErrors.push(emailError.message);
      }
    } else {
      console.warn("[subscribe] Email configuration missing (FORWARD_TO_EMAIL or RESEND_API_KEY)");
    }

    // 2. Save to Database (Priority: High)
    // We use the Admin client to bypass RLS and ensure we can write to the table.
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
      }
    } catch (dbError: any) {
      console.error("[subscribe] Database connection failed:", dbError);
      dbErrors.push(dbError.message);
    }

    // 3. AI Agent Forwarding (Priority: Low - Fire and Forget)
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

  } catch (error) {
    console.error("[subscribe] Critical route error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
