import { NextRequest } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { focusGroupFeedbackSchema } from '@/lib/validation/schemas';
import { calculateWeekNumber } from '@/lib/focus-group/week-calculation';
import { successResponse, ApiErrors } from '@/lib/api/response';
import type { Database } from '@/types/supabase';

/**
 * POST /api/focus-group/feedback
 * Submit weekly feedback
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase(req);

    // Get authenticated user (uses Authorization header)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return ApiErrors.unauthorized();
    }

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

    // Check for existing feedback for this week
    const { data: existingFeedback } = await supabase
      .from('feedback')
      .select('id')
      .eq('user_id', user.id)
      .eq('week', weekNumber)
      .maybeSingle();

    if (existingFeedback) {
      return ApiErrors.conflict(
        `Feedback for week ${weekNumber} already exists. You can update it instead.`
      );
    }

    // Map focusGroupFeedbackSchema fields to database schema fields
    // Database expects: hydration_rating, tone_rating, texture_rating, overall_rating (1-5), notes
    // Form provides: overall_rating (1-10), product_usage, perceived_changes, concerns_or_issues, emotional_response, next_week_focus
    const notesText = [
      data.product_usage && `Product Usage: ${data.product_usage}`,
      data.perceived_changes && `Perceived Changes: ${data.perceived_changes}`,
      data.concerns_or_issues && `Concerns/Issues: ${data.concerns_or_issues}`,
      data.emotional_response && `Emotional Response: ${data.emotional_response}`,
      data.next_week_focus && `Next Week Focus: ${data.next_week_focus}`,
    ].filter(Boolean).join('\n\n') || null;

    // Scale rating from 1-10 (form) to 1-5 (database)
    // Formula: (value - 1) * (5 - 1) / (10 - 1) + 1 = (value - 1) * 4/9 + 1
    const scaleRating = (rating: number | undefined): number => {
      if (!rating) return 3; // Default to middle
      // Scale 1-10 to 1-5, rounding to nearest integer
      return Math.round(((rating - 1) * 4 / 9) + 1);
    };

    const scaledRating = scaleRating(data.overall_rating);

    // Insert feedback - using the correct table name and structure from schema
    const { data: feedback, error: insertError } = await supabase
      .from('feedback')
      .insert({
        user_id: user.id,
        week: weekNumber,
        // Use scaled overall_rating for all rating fields
        hydration_rating: scaledRating,
        tone_rating: scaledRating,
        texture_rating: scaledRating,
        overall_rating: scaledRating,
        notes: notesText,
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
  try {
    const supabase = await createServerSupabase(req);

    // Get authenticated user (uses Authorization header)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return ApiErrors.unauthorized();
    }

    // Get feedback history - using correct table name and user_id
    const { data: feedback, error: fetchError } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', user.id)
      .order('week', { ascending: true });

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

