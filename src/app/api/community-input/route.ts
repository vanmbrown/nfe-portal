import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, ageRange, skinDescription, concerns, message } = body;

    // Send email notification using Resend
    if (process.env.FORWARD_TO_EMAIL && process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "NFE Portal <notifications@nfebeauty.com>",
        to: process.env.FORWARD_TO_EMAIL,
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
    }

    // Also forward to AI agent if configured
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Community Input API error:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

