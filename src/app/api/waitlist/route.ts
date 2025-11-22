import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminSupabase } from "@/lib/supabase/server";
// import { waitlistRatelimit } from "@/lib/ratelimit"; // Temporarily disabled

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    console.log('[waitlist] Starting request processing');
    
    // Rate limiting temporarily disabled due to Upstash connection issues
    // TODO: Re-enable once Upstash connection is stable
    // if (waitlistRatelimit) {
    //   try {
    //     const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'anonymous';
    //     const { success, limit, remaining, reset } = await waitlistRatelimit.limit(ip);
    //     if (!success) {
    //       return NextResponse.json(
    //         { error: 'Too many requests. Please try again later.' },
    //         { status: 429 }
    //       );
    //     }
    //   } catch (rateLimitError: any) {
    //     console.error('[waitlist] Rate limit check failed (continuing):', rateLimitError?.message || rateLimitError);
    //   }
    // }

    const { email, product } = await req.json();
    console.log('[waitlist] Processing:', { email, product });
    if (
      !email ||
      typeof email !== "string" ||
      !email.includes("@") ||
      !product ||
      typeof product !== "string"
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    console.log('[waitlist] Creating admin Supabase client');
    const supabase = createAdminSupabase();
    
    console.log('[waitlist] Inserting into waitlist table');
    // @ts-ignore - waitlist table exists but not in generated types yet
    const { error } = await supabase.from("waitlist").insert({ email, product });

    if (error) {
      console.error("[waitlist] supabase insert failed:", error);
      
      // Check if it's a duplicate key error
      if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('already exists')) {
        return NextResponse.json(
          { error: "This email is already on the waitlist." },
          { status: 409 }
        );
      }
      
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
    
    console.log('[waitlist] Successfully inserted waitlist entry');

    // Return success immediately - don't wait for email/AI forwarding
    // This ensures fast response to user
    const response = NextResponse.json({ success: true });

    // Send email notification in background (fire-and-forget)
    if (process.env.FORWARD_TO_EMAIL && process.env.RESEND_API_KEY) {
      resend.emails.send({
        from: "NFE Portal <notifications@nfebeauty.com>",
        to: process.env.FORWARD_TO_EMAIL,
        subject: "New Waitlist Submission",
        html: `<p><strong>Email:</strong> ${email}</p><p><strong>Product:</strong> ${product}</p><p><strong>Time:</strong> ${new Date().toISOString()}</p>`,
      }).catch((emailError) => {
        console.error("[waitlist] email send failed (non-fatal):", emailError);
      });
    }

    // Forward to AI agent in background (fire-and-forget)
    if (process.env.FORWARD_TO_AI_URL) {
      fetch(process.env.FORWARD_TO_AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "waitlist",
          email,
          product,
        }),
      }).catch((aiError) => {
        console.error("[waitlist] AI forward failed (non-fatal):", aiError);
      });
    }

    return response;
  } catch (error) {
    console.error("[waitlist] route failed", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

