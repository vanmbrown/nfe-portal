import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminSupabase } from "@/lib/supabase/server";
// import { subscribeRatelimit } from "@/lib/ratelimit"; // Temporarily disabled

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    console.log('[subscribe] Starting request processing');
    
    // Rate limiting temporarily disabled due to Upstash connection issues
    // TODO: Re-enable once Upstash connection is stable

    const { email } = await req.json();
    console.log('[subscribe] Processing email:', email);

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    console.log('[subscribe] Creating admin Supabase client');
    const supabase = createAdminSupabase();
    
    console.log('[subscribe] Inserting into subscribers table');
    // @ts-ignore - subscribers table exists but not in generated types yet
    const { error } = await supabase.from("subscribers").insert({ email });

    if (error) {
      console.error("[subscribe] supabase insert failed:", error);
      
      // Check if it's a duplicate key error
      if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('already exists')) {
        return NextResponse.json(
          { error: "This email is already subscribed." },
          { status: 409 }
        );
      }
      
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
    
    console.log('[subscribe] Successfully inserted email');

    // Return success immediately - don't wait for email/AI forwarding
    // This ensures fast response to user
    const response = NextResponse.json({ success: true });

    // Send email notification in background (fire-and-forget)
    if (process.env.FORWARD_TO_EMAIL && process.env.RESEND_API_KEY) {
      resend.emails.send({
        from: "NFE Portal <notifications@nfebeauty.com>",
        to: process.env.FORWARD_TO_EMAIL,
        subject: "New Newsletter Subscriber",
        html: `<p><strong>Email:</strong> ${email}</p><p><strong>Time:</strong> ${new Date().toISOString()}</p>`,
      }).catch((emailError) => {
        console.error("[subscribe] email send failed (non-fatal):", emailError);
      });
    }

    // Forward to AI agent in background (fire-and-forget)
    if (process.env.FORWARD_TO_AI_URL) {
      fetch(process.env.FORWARD_TO_AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "subscribe",
          email,
        }),
      }).catch((aiError) => {
        console.error("[subscribe] AI forward failed (non-fatal):", aiError);
      });
    }

    return response;
  } catch (error) {
    console.error("[subscribe] route failed", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

