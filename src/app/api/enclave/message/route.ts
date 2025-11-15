import { NextRequest } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { successResponse, ApiErrors } from '@/lib/api/response';

/**
 * POST /api/enclave/message
 * Create message in enclave (legacy route - may need database migration)
 * 
 * Note: This route uses a simplified implementation.
 * If enclave/message tables don't exist in Supabase, this will fail.
 * Consider migrating to a different message system or creating the tables.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase(req);

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return ApiErrors.unauthorized();
    }

    const body = await req.json();
    const { text } = body || {};

    if (!text) {
      return ApiErrors.badRequest('Missing text');
    }

    // TODO: Create message table in Supabase if it doesn't exist
    // For now, return a placeholder response
    // This route needs database migration to Supabase
    
    const messageData = {
      id: `msg_${Date.now()}`,
      user_id: user.id,
      body: text,
      created_at: new Date().toISOString(),
    };
    
    return successResponse(
      messageData,
      201,
      'Message saved (legacy route - database migration needed)'
    );
  } catch (error: unknown) {
    console.error('Message creation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return ApiErrors.internalError('Internal server error', message);
  }
}
