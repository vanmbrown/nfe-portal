import { NextRequest } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { successResponse, ApiErrors } from '@/lib/api/response';
import type { Database } from '@/types/supabase';

/**
 * POST /api/uploads/record
 * Create upload record in Supabase (legacy route - consider migrating to /api/focus-group/uploads)
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
    const { filename, url, size, mimeType } = body || {};

    if (!filename || !url) {
      return ApiErrors.badRequest('Missing filename or url');
    }

    // Create record in images table (Supabase schema)
    // Note: This route is legacy - new uploads should use /api/focus-group/uploads
    const { data: uploadRecord, error: insertError } = await supabase
      .from('images')
      .insert({
        user_id: user.id,
        type: 'during', // Default type
        filename: filename,
        url: url,
        mime_type: mimeType || 'application/octet-stream',
        size: Number(size || 0),
        image_consent: true, // Default to true for legacy route
        marketing_consent: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return ApiErrors.internalError('Failed to create upload record', insertError.message);
    }

    return successResponse(uploadRecord, 201, 'Upload record created successfully');
  } catch (error: unknown) {
    console.error('Upload record error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return ApiErrors.internalError('Internal server error', message);
  }
}
