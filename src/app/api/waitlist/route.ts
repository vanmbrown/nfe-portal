import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminSupabase } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const OWNER_EMAIL = process.env.FORWARD_TO_EMAIL || "vanessa@nfebeauty.com";

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

    // 1. Check for duplicate email/product combination first (Priority: High)
    let dbSuccess = false;
    try {
      const supabase = createAdminSupabase();
      
      // Check if email/product combination already exists
      const { data: existingEntry, error: checkError } = await supabase
        .from("waitlist")
        .select("email, product")
        .eq("email", email.toLowerCase().trim())
        .eq("product", product)
        .maybeSingle();

      if (checkError) {
        console.error("[waitlist] Database check failed:", checkError);
        dbErrors.push(checkError.message);
      } else if (existingEntry) {
        // Email/product combination already exists
        return NextResponse.json(
          { error: "This email is already on the waitlist for this product." },
          { status: 409 }
        );
      }

      // 2. Insert new waitlist entry
      const { error: insertError } = await supabase
        .from("waitlist")
        .insert({ email: email.toLowerCase().trim(), product });

      if (insertError) {
        // Double-check for duplicate (in case of race condition)
        if (insertError.code === '23505' || insertError.message?.includes('duplicate') || insertError.message?.includes('already exists')) {
          return NextResponse.json(
            { error: "This email is already on the waitlist for this product." },
            { status: 409 }
          );
        }
        console.error("[waitlist] Database insert failed:", insertError);
        dbErrors.push(insertError.message);
      } else {
        dbSuccess = true;
      }
    } catch (dbError: any) {
      console.error("[waitlist] Database connection failed:", dbError);
      dbErrors.push(dbError.message);
    }

    // 3. Send Email Notification to Owner (Priority: High) - Only if successfully added
    if (dbSuccess) {
      if (!process.env.RESEND_API_KEY) {
        console.error("[waitlist] RESEND_API_KEY is missing - cannot send owner notification");
        emailErrors.push("Email service not configured");
      } else {
        try {
          const notificationResult = await resend.emails.send({
            from: "NFE Beauty <notifications@nfebeauty.com>",
            to: OWNER_EMAIL,
            subject: `New Waitlist: ${product}`,
            html: `
              <h2>New Waitlist Submission</h2>
              <p><strong>Product:</strong> ${product}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            `,
          });
          console.log("[waitlist] Owner notification email sent successfully to:", OWNER_EMAIL, notificationResult);
        } catch (emailError: any) {
          console.error("[waitlist] Email send failed:", emailError);
          emailErrors.push(emailError.message);
        }
      }
    }

    // 4. AI Agent Forwarding (Priority: Low)
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
