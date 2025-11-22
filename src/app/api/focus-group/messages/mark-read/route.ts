import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase as createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, ApiErrors } from '@/lib/api/response';

/**
 * POST /api/focus-group/messages/mark-read
 * Mark all unread admin messages as read for the current user
 */
export async function POST(_req: NextRequest) {
  // Pass request to createServerSupabaseClient so it can read cookies and Authorization header
  const supabase = await createServerSupabaseClient(_req);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {

    // Mark all unread admin messages as read
    const { error: updateError } = await supabase
      .from('focus_group_messages')
      .update({ is_read: true })
      .eq('recipient_id', user.id)
      .eq('sender_role', 'admin')
      .eq('is_read', false);

    if (updateError) {
      console.error('Update error:', updateError);
      return ApiErrors.internalError('Failed to mark messages as read', updateError.message);
    }

    return successResponse({ success: true }, 200, 'Messages marked as read');
  } catch (error: unknown) {
    console.error('Mark read error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return ApiErrors.internalError('Internal server error', message);
  }
}

