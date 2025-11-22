import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase as createServerSupabaseClient } from '@/lib/supabase/server';
import { successResponse, ApiErrors } from '@/lib/api/response';

/**
 * POST /api/focus-group/messages/send
 * Send a message
 * For participants: sender = 'user', recipientUserId is ignored (uses current user)
 * For admins: sender = 'admin', recipientUserId is required
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

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .maybeSingle();

    const isAdmin = profile?.is_admin === true;

    // Parse request body
    const body = await req.json();
    const { message, recipientUserId } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return ApiErrors.badRequest('Message text is required');
    }

    let targetRecipientId: string;
    let senderRole: 'admin' | 'user';

    if (isAdmin && recipientUserId) {
      // Admin mode: sending to a specific user
      targetRecipientId = recipientUserId;
      senderRole = 'admin';
    } else {
      // Participant mode (or admin messaging themselves/acting as participant)
      // If admin doesn't specify recipient, it goes to their own thread
      targetRecipientId = user.id; 
      // If admin is messaging themselves, we can default to 'admin' role, 
      // but if they are using the main message UI, they might be testing user flow.
      // However, since they ARE admin, 'admin' role is technically correct.
      senderRole = isAdmin ? 'admin' : 'user';
    }

    console.log('[Message Send] Sending message:', {
      senderId: user.id,
      recipientId: targetRecipientId,
      senderRole,
      isAdmin,
      messageLength: message.trim().length
    });

    // Create message record
    const { data: messageRecord, error: insertError } = await supabase
      .from('focus_group_messages')
      .insert({
        sender_id: user.id,
        recipient_id: targetRecipientId,
        sender_role: senderRole,
        message_text: message.trim(),
        is_read: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return ApiErrors.internalError(`Failed to send message: ${insertError.message}`, insertError.details);
    }

    // Map to expected format
    const mappedMessage = {
      ...messageRecord,
      user_id: messageRecord.recipient_id,
      sender: messageRecord.sender_role as 'admin' | 'user',
      message: messageRecord.message_text,
    };

    return successResponse(mappedMessage, 201, 'Message sent successfully');
  } catch (error: unknown) {
    console.error('Message send error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return ApiErrors.internalError('Internal server error', message);
  }
}

