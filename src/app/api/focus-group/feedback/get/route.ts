import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase as createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const week = Number(searchParams.get('week'));

    if (!week) {
      return NextResponse.json({ error: "Missing week" }, { status: 400 });
    }

    // Pass request to createServerSupabaseClient so it can read cookies and Authorization header
    const supabase = await createServerSupabaseClient(req);

    // Authenticate
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Auth error:", userError);
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get profile for this user
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    console.log(`[Feedback GET] Fetching for Profile: ${profile.id}, Week: ${week}`);

    // Fetch feedback
    const { data, error } = await supabase
      .from("focus_group_feedback")
      .select("*")
      .eq("profile_id", profile.id)
      .eq("week_number", week)
      .maybeSingle();

    if (error) {
      console.error("Feedback DB error:", error);
      return NextResponse.json(
        { error: "Database error", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ feedback: data ?? null });

  } catch (err) {
    console.error("Fatal Feedback GET Error:", err);
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}
