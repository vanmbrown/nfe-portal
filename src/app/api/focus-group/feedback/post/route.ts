import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase as createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { week_number, product_usage, perceived_changes,
      concerns_or_issues, emotional_response, overall_rating,
      next_week_focus } = body;

    if (!week_number) {
      return NextResponse.json({ error: "Missing week_number" }, { status: 400 });
    }

    // Pass request to createServerSupabaseClient so it can read cookies and Authorization header
    const supabase = await createServerSupabaseClient(req);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!user || userError) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    console.log(`[Feedback API] Upserting for Profile: ${profile.id}, Week: ${week_number}`);

    // Upsert feedback
    const { error } = await supabase
      .from("focus_group_feedback")
      .upsert({
        profile_id: profile.id,
        week_number,
        product_usage,
        perceived_changes,
        concerns_or_issues,
        emotional_response,
        overall_rating,
        next_week_focus,
      }, { onConflict: "profile_id,week_number" });

    if (error) {
      console.error("Feedback POST error:", error);
      return NextResponse.json({ error: "Database error", details: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Fatal Feedback POST Error:", err);
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}
