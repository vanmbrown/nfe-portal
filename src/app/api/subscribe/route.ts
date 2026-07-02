import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminSupabase } from "@/lib/supabase/server";
import { escapeHtml } from "@/lib/utils/sanitize";
import { subscribeRatelimit } from "@/lib/ratelimit";
import type { NfeAttributionContext } from "@/lib/analytics/utm";
import { syncBeehiivSubscriber } from "@/lib/beehiiv/subscriber";
import type { ConsentSource, CustomerIntentType } from "@/lib/customer-intelligence/types";

// Lazy Resend instantiation - only create when needed (not at module load time)
const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(apiKey);
};

const ADMIN_NOTIFICATION_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL || process.env.FORWARD_TO_EMAIL;

function cleanString(value: unknown, maxLength = 180): string | undefined {
  if (typeof value !== "string") return undefined;

  const cleaned = value.trim().slice(0, maxLength);
  return cleaned || undefined;
}

function cleanBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function cleanIntent(value: unknown): CustomerIntentType {
  const supportedIntents: CustomerIntentType[] = [
    'founder_access',
    'discovery',
    'skin_ritual_quiz',
    'concierge',
    'review',
    'replenishment',
    'wholesale',
    'press',
  ];

  return typeof value === 'string' && supportedIntents.includes(value as CustomerIntentType)
    ? (value as CustomerIntentType)
    : 'founder_access';
}

function cleanConsentSource(value: unknown): ConsentSource {
  const supportedSources: ConsentSource[] = [
    'subscribe_page',
    'founder_access',
    'discovery',
    'skin_ritual_quiz',
    'concierge',
    'future_form',
  ];

  return typeof value === 'string' && supportedSources.includes(value as ConsentSource)
    ? (value as ConsentSource)
    : 'subscribe_page';
}

function cleanAttribution(value: unknown): NfeAttributionContext {
  if (!value || typeof value !== "object") return {};

  const attribution = value as Record<string, unknown>;

  return {
    utmSource: cleanString(attribution.utmSource),
    utmMedium: cleanString(attribution.utmMedium),
    utmCampaign: cleanString(attribution.utmCampaign),
    utmTerm: cleanString(attribution.utmTerm),
    utmContent: cleanString(attribution.utmContent),
    referrer: cleanString(attribution.referrer, 300),
    landingPage: cleanString(attribution.landingPage, 300),
    capturedAt: cleanString(attribution.capturedAt, 60),
  };
}

function cleanContext(value: unknown) {
  if (!value || typeof value !== "object") return {};

  const context = value as Record<string, unknown>;

  return {
    intent: cleanString(context.intent),
    pagePath: cleanString(context.pagePath),
    consentSource: cleanString(context.consentSource),
    marketingOptIn: cleanBoolean(context.marketingOptIn),
    privacyPolicyAccepted: cleanBoolean(context.privacyPolicyAccepted),
  };
}

function renderOptionalContext({
  source,
  context,
  attribution,
  beehiivStatus,
  beehiivReason,
}: {
  source?: string;
  context: ReturnType<typeof cleanContext>;
  attribution: NfeAttributionContext;
  beehiivStatus?: string;
  beehiivReason?: string;
}) {
  const rows = [
    ["Source", source],
    ["Intent", context.intent],
    ["Page", context.pagePath],
    ["Consent Source", context.consentSource],
    ["Marketing Opt-In", context.marketingOptIn],
    ["Privacy Accepted", context.privacyPolicyAccepted],
    ["UTM Source", attribution.utmSource],
    ["UTM Medium", attribution.utmMedium],
    ["UTM Campaign", attribution.utmCampaign],
    ["UTM Content", attribution.utmContent],
    ["Landing Page", attribution.landingPage],
    ["Referrer", attribution.referrer],
    ["Beehiiv Status", beehiivStatus],
    ["Beehiiv Reason", beehiivReason],
  ].filter(([, value]) => value !== undefined && value !== "");

  if (rows.length === 0) return "";

  return rows
    .map(
      ([label, value]) =>
        `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(String(value))}</p>`
    )
    .join("");
}

export async function POST(req: Request) {
  try {
    if (subscribeRatelimit) {
      const ip = req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for') ?? 'anonymous';
      const { success } = await subscribeRatelimit.limit(ip);
      if (!success) {
        return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
      }
    }

    const payload = await req.json();
    const { email } = payload;
    const source = cleanString(payload.source);
    const context = cleanContext(payload.context);
    const attribution = cleanAttribution(payload.attribution);

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const emailErrors = [];
    const dbErrors = [];
    let beehiivStatus: string | undefined;
    let beehiivReason: string | undefined;

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
          const resend = getResend();
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

    if (dbSuccess) {
      const beehiivResult = await syncBeehiivSubscriber({
        email,
        intent: cleanIntent(context.intent),
        source: cleanConsentSource(context.consentSource ?? source),
        pagePath: context.pagePath,
        consentSource: context.consentSource,
        marketingOptIn: context.marketingOptIn,
        privacyPolicyAccepted: context.privacyPolicyAccepted,
        attribution,
      });
      beehiivStatus = beehiivResult.status;
      beehiivReason = beehiivResult.reason;
    }

    // 4. Send Email Notification to Owner (Priority: High)
    if (dbSuccess) {
      if (!process.env.RESEND_API_KEY) {
        console.error("[subscribe] RESEND_API_KEY is missing - cannot send owner notification");
        emailErrors.push("Email service not configured");
      } else if (!ADMIN_NOTIFICATION_EMAIL) {
        console.error("[subscribe] ADMIN_NOTIFICATION_EMAIL is missing - cannot send owner notification");
        emailErrors.push("Admin notification email not configured");
      } else {
        try {
          const resend = getResend();
          await resend.emails.send({
            from: "NFE Beauty <notifications@nfebeauty.com>",
            to: "vanessa@nfebeauty.com",
            subject: "New Newsletter Subscriber",
            html: `
              <p><strong>Email:</strong> ${escapeHtml(email)}</p>
              <p><strong>Time:</strong> ${new Date().toISOString()}</p>
              ${renderOptionalContext({
                source,
                context,
                attribution,
                beehiivStatus,
                beehiivReason,
              })}
            `,
          });
        } catch (emailError: any) {
          console.error("[subscribe] admin receipt failed:", emailError);
          emailErrors.push(emailError.message);
        }
      }
    }

    // 5. AI Agent Forwarding (Priority: Low - Fire and Forget)
    if (process.env.FORWARD_TO_AI_URL) {
      fetch(process.env.FORWARD_TO_AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "subscribe",
          email,
          source,
          context,
          attribution,
        }),
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
