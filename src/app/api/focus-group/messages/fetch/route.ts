import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase as createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, ApiErrors, errorResponse } from '@/lib/api/response';

/**
 * GET /api/focus-group/messages/fetch?userId={userId}
 * Retrieve messages for the current user (participant) or for a specific user (admin)
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

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .maybeSingle();

    const isAdmin = profile?.is_admin === true;

    // Get userId from query params (for admin mode)
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get('userId');

    let targetUserId: string;

    if (userIdParam) {
      // Admin mode: fetch messages for specified user (requires admin check)
      if (!isAdmin) {
        return errorResponse('Only admins can view other users\' messages', 403);
      }
      targetUserId = userIdParam;
    } else {
      // No userId param: fetch messages for current user (works for both admin and participant)
      targetUserId = user.id;
    }

    // Fetch messages for the conversation thread
    // Get messages where recipient_id = targetUserId (messages TO the user)
    // AND messages where sender_id = targetUserId (messages FROM the user)
    // This gives us the full conversation thread
    console.log('[Messages Fetch] Fetching messages for userId:', targetUserId, 'isAdmin:', isAdmin);
    const { data: messages, error: fetchError } = await supabase
      .from('focus_group_messages')
      .select('*')
      .or(`recipient_id.eq.${targetUserId},sender_id.eq.${targetUserId}`)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('[Messages Fetch] Error:', fetchError);
      return ApiErrors.internalError('Failed to fetch messages', fetchError.message);
    }
    
    console.log('[Messages Fetch] Found', messages?.length || 0, 'messages');

    // Map to expected format
    const mappedMessages = (messages || []).map((msg) => ({
      ...msg,
      user_id: msg.recipient_id,
      sender: msg.sender_role as 'admin' | 'user',
      message: msg.message_text,
    }));

    return successResponse(mappedMessages);
  } catch (error: unknown) {
    console.error('Messages fetch error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return ApiErrors.internalError('Internal server error', message);
  }
}

