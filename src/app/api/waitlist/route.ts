import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminSupabase } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, product } = await req.json();

    if (
      !email ||
      typeof email !== "string" ||
      !email.includes("@") ||
      !product ||
      typeof product !== "string"
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const emailErrors = [];
    const dbErrors = [];

    // 1. Send Email Notification (Priority: High)
    if (process.env.FORWARD_TO_EMAIL && process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: "NFE Portal <notifications@nfebeauty.com>",
          to: process.env.FORWARD_TO_EMAIL,
          subject: `New Waitlist: ${product}`,
          html: `
            <h2>New Waitlist Submission</h2>
            <p><strong>Product:</strong> ${product}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          `,
        });
      } catch (emailError: any) {
        console.error("[waitlist] Email send failed:", emailError);
        emailErrors.push(emailError.message);
      }
    } else {
      console.warn("[waitlist] Email configuration missing");
    }

    // 2. Save to Database (Priority: High)
    try {
      const supabase = createAdminSupabase();
      const { error } = await supabase.from("waitlist").insert({ email, product });

      if (error) {
        if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('already exists')) {
          return NextResponse.json(
            { error: "This email is already on the waitlist for this product." },
            { status: 409 }
          );
        }
        console.error("[waitlist] Database insert failed:", error);
        dbErrors.push(error.message);
      }
    } catch (dbError: any) {
      console.error("[waitlist] Database connection failed:", dbError);
      dbErrors.push(dbError.message);
    }

    // 3. AI Agent Forwarding (Priority: Low)
    if (process.env.FORWARD_TO_AI_URL) {
      fetch(process.env.FORWARD_TO_AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "waitlist", email, product }),
      }).catch((err) => console.error("[waitlist] AI forward failed:", err));
    }

    // Response Logic
    if (emailErrors.length > 0 && dbErrors.length > 0) {
      return NextResponse.json(
        { error: "System busy. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[waitlist] Critical route error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
