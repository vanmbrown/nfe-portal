import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase as createServerSupabaseClient } from '@/lib/supabase/server';
import { focusGroupUploadSchema } from '@/lib/validation/schemas';
import { calculateWeekNumber } from '@/lib/focus-group/week-calculation';
import { uploadToSupabaseStorage, getSignedUrl } from '@/lib/storage/supabase-storage';
import { successResponse, ApiErrors } from '@/lib/api/response';
import type { Database } from '@/types/supabase';

/**
 * POST /api/focus-group/uploads
 * Handle file upload to Supabase Storage
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

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, created_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile) {
      return ApiErrors.notFound('User profile not found');
    }

    // Parse form data
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const notes = formData.get('notes') as string | null;
    const consentGiven = formData.get('consent_given') === 'true';
    const weekNumberParam = formData.get('week_number');

    // Validate consent
    if (!consentGiven) {
      return ApiErrors.badRequest('Image consent is required');
    }

    // Validate files
    if (!files || files.length === 0) {
      return ApiErrors.badRequest('At least one image file is required');
    }

    if (files.length > 3) {
      return ApiErrors.badRequest('Maximum 3 images allowed per upload');
    }

    // Calculate week number
    let weekNumber: number;
    const profileData = profile as { created_at?: string } | null;
    if (weekNumberParam) {
      weekNumber = parseInt(weekNumberParam as string, 10);
      if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 52) {
        return ApiErrors.badRequest('Invalid week number');
      }
    } else if (profileData?.created_at) {
      weekNumber = calculateWeekNumber(profileData.created_at);
    } else {
      return ApiErrors.badRequest('Week number is required');
    }

    // Upload files and create records
    type UploadRow = Database['public']['Tables']['focus_group_uploads']['Row'];
    const uploadResults: UploadRow[] = [];

    for (const file of files) {
      try {
        // Upload to Supabase Storage (using profile.id instead of user.id)
        const imageUrl = await uploadToSupabaseStorage(supabase, file, profile.id, weekNumber);

        // Create database record - using 'focus_group_uploads' table
        const { data: uploadRecord, error: insertError } = await supabase
          .from('focus_group_uploads')
          .insert({
            profile_id: profile.id,
            week_number: weekNumber,
            image_url: imageUrl,
            notes: notes || null,
            consent_given: consentGiven,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Insert error:', insertError);
          // Continue with other files even if one fails
          continue;
        }

        uploadResults.push(uploadRecord);
      } catch (uploadError: unknown) {
        console.error('Upload error:', uploadError);
        // Continue with other files even if one fails
        continue;
      }
    }

    if (uploadResults.length === 0) {
      return ApiErrors.internalError('Failed to upload all files');
    }

    return successResponse(uploadResults, 201, 'Files uploaded successfully');
  } catch (error: unknown) {
    console.error('Upload submission error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return ApiErrors.internalError('Internal server error', message);
  }
}

/**
 * GET /api/focus-group/uploads
 * Retrieve user's upload history
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
    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile) {
      return ApiErrors.notFound('User profile not found');
    }

    // Get upload history - using 'focus_group_uploads' table
    const { data: uploads, error: fetchError } = await supabase
      .from('focus_group_uploads')
      .select('*')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return ApiErrors.internalError('Failed to fetch uploads', fetchError.message);
    }

    // Generate signed URLs for private images
    const uploadsWithSignedUrls = await Promise.all(
      (uploads || []).map(async (upload: unknown) => {
        try {
          const uploadRecord = upload as { image_url?: string; [key: string]: unknown };
          const url = uploadRecord.image_url;
          if (!url || typeof url !== 'string') {
            return uploadRecord;
          }
          const signedUrl = await getSignedUrl(supabase, url);
          return {
            ...uploadRecord,
            signed_url: signedUrl,
          };
        } catch (error) {
          console.error('Error generating signed URL:', error);
          const uploadRecord = upload as { image_url?: string; [key: string]: unknown };
          const url = uploadRecord.image_url || '';
          return {
            ...uploadRecord,
            signed_url: url, // Fallback to original URL
          };
        }
      })
    );

    return successResponse(uploadsWithSignedUrls);
  } catch (error: unknown) {
    console.error('Upload fetch error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return ApiErrors.internalError('Internal server error', message);
  }
}

