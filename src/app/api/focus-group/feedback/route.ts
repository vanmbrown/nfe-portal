import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase as createServerSupabaseClient } from '@/lib/supabase/server';
import { focusGroupFeedbackSchema } from '@/lib/validation/schemas';
import { calculateWeekNumber } from '@/lib/focus-group/week-calculation';
import { successResponse, ApiErrors } from '@/lib/api/response';
import type { Database } from '@/types/supabase';

/**
 * POST /api/focus-group/feedback
 * Submit weekly feedback
 */
export async function POST(req: NextRequest) {
  // Pass request to createServerSupabaseClient so it can read cookies and Authorization header
  const supabase = await createServerSupabaseClient(req);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {

    // Get user's profile to calculate week number
    const { data: profile } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('user_id', user.id)
      .maybeSingle();

    // Parse and validate request body
    const body = await req.json();
    const validationResult = focusGroupFeedbackSchema.safeParse(body);

    if (!validationResult.success) {
      return ApiErrors.badRequest('Invalid data', validationResult.error.errors);
    }

    const data = validationResult.data;

    // Auto-calculate week number if not provided or if profile created_at exists
    let weekNumber = data.week_number;
    const profileData = profile as { created_at?: string } | null;
    if (profileData?.created_at) {
      const calculatedWeek = calculateWeekNumber(profileData.created_at);
      // Use calculated week if no week_number provided, or validate provided week
      if (!data.week_number) {
        weekNumber = calculatedWeek;
      } else if (data.week_number !== calculatedWeek) {
        // Allow manual override but warn
        console.warn(`Week number mismatch: provided ${data.week_number}, calculated ${calculatedWeek}`);
      }
    }

    // Get user's profile ID
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!userProfile) {
      return ApiErrors.notFound('User profile not found');
    }

    // Check for existing feedback for this week
    const { data: existingFeedback } = await supabase
      .from('focus_group_feedback')
      .select('id')
      .eq('profile_id', userProfile.id)
      .eq('week_number', weekNumber)
      .maybeSingle();

    if (existingFeedback) {
      return ApiErrors.conflict(
        `Feedback for week ${weekNumber} already exists. You can update it instead.`
      );
    }

    // Insert feedback - using the correct table name and structure from schema
    // Database expects: profile_id, week_number, product_usage, perceived_changes, concerns_or_issues, emotional_response, overall_rating, next_week_focus
    const { data: feedback, error: insertError } = await supabase
      .from('focus_group_feedback')
      .insert({
        profile_id: userProfile.id,
        week_number: weekNumber,
        product_usage: data.product_usage || null,
        perceived_changes: data.perceived_changes || null,
        concerns_or_issues: data.concerns_or_issues || null,
        emotional_response: data.emotional_response || null,
        overall_rating: data.overall_rating || null,
        next_week_focus: data.next_week_focus || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return ApiErrors.internalError('Failed to save feedback', insertError.message);
    }

    return successResponse(feedback, 201, 'Feedback submitted successfully');
  } catch (error: unknown) {
    console.error('Feedback submission error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return ApiErrors.internalError('Internal server error', message);
  }
}

/**
 * GET /api/focus-group/feedback
 * Retrieve user's feedback history
 */
export async function GET(req: NextRequest) {
  // Pass request to createServerSupabaseClient so it can read cookies and Authorization header
  const supabase = await createServerSupabaseClient(req);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // Get user's profile ID
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!userProfile) {
      return ApiErrors.notFound('User profile not found');
    }

    // Get feedback history - using correct table name and profile_id
    const { data: feedback, error: fetchError } = await supabase
      .from('focus_group_feedback')
      .select('*')
      .eq('profile_id', userProfile.id)
      .order('week_number', { ascending: true });

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return ApiErrors.internalError('Failed to fetch feedback', fetchError.message);
    }

    return successResponse(feedback || []);
  } catch (error: unknown) {
    console.error('Feedback fetch error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return ApiErrors.internalError('Internal server error', message);
  }
}

