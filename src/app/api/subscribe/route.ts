import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminSupabase } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const OWNER_EMAIL = process.env.FORWARD_TO_EMAIL || "vanessa.mccaleb@gmail.com";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const emailErrors = [];
    const dbErrors = [];

    // 1. Check for duplicate email first (Priority: High)
    // We use the Admin client to bypass RLS and ensure we can check the table.
    let dbSuccess = false;
    try {
      const supabase = createAdminSupabase();
      
      // Check if email already exists
      const { data: existingSubscriber, error: checkError } = await supabase
        .from("subscribers")
        .select("email")
        .eq("email", email.toLowerCase().trim())
        .maybeSingle();

      if (checkError) {
        console.error("[subscribe] Database check failed:", checkError);
        dbErrors.push(checkError.message);
      } else if (existingSubscriber) {
        // Email already exists
        return NextResponse.json(
          { code: "duplicate", message: "This email address is already on the list." },
          { status: 409 }
        );
      }

      // 2. Insert new subscriber
      const { error: insertError } = await supabase
        .from("subscribers")
        .insert({ email: email.toLowerCase().trim() });

      if (insertError) {
        // Double-check for duplicate (in case of race condition)
        if (insertError.code === '23505' || insertError.message?.includes('duplicate') || insertError.message?.includes('already exists')) {
          return NextResponse.json(
            { code: "duplicate", message: "This email address is already on the list." },
            { status: 409 }
          );
        }
        console.error("[subscribe] Database insert failed:", insertError);
        dbErrors.push(insertError.message);
      } else {
        dbSuccess = true;
      }
    } catch (dbError: any) {
      console.error("[subscribe] Database connection failed:", dbError);
      dbErrors.push(dbError.message);
    }

    // 3. Send Confirmation Email to Subscriber (Priority: High)
    if (dbSuccess) {
      if (!process.env.RESEND_API_KEY) {
        console.error("[subscribe] RESEND_API_KEY is missing - cannot send confirmation email");
        emailErrors.push("Email service not configured");
      } else {
        try {
          const confirmationResult = await resend.emails.send({
            from: "NFE Beauty <notifications@nfebeauty.com>",
            to: email,
            subject: "Welcome to the NFE Community",
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
    }

    // 4. Send Email Notification to Owner (Priority: High)
    // We want to notify vanessa.mccaleb@gmail.com immediately.
    if (dbSuccess) {
      if (!process.env.RESEND_API_KEY) {
        console.error("[subscribe] RESEND_API_KEY is missing - cannot send owner notification");
        emailErrors.push("Email service not configured");
      } else {
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
      }
    }

    // 5. AI Agent Forwarding (Priority: Low - Fire and Forget)
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
