import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase as createServerSupabaseClient } from '@/lib/supabase/server';
import { uploadToSupabaseStorage } from '@/lib/storage/supabase-storage';
import { successResponse, ApiErrors } from '@/lib/api/response';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 10; // Maximum files per upload

/**
 * POST /api/focus-group/uploads/upload
 * Upload files for a specific week
 * Files stored in Supabase storage bucket: focus-group-uploads
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

    // Get user's profile to find profile_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile) {
      return ApiErrors.notFound('Profile not found. Please complete your profile first.');
    }

    // Parse form data
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const weekParam = formData.get('week');

    // Validate week
    if (!weekParam) {
      return ApiErrors.badRequest('Week parameter is required');
    }

    const week = parseInt(weekParam.toString(), 10);
    if (isNaN(week) || week < 1 || week > 52) {
      return ApiErrors.badRequest('Week must be a number between 1 and 52');
    }

    // Validate files
    if (!files || files.length === 0) {
      return ApiErrors.badRequest('At least one file is required');
    }

    if (files.length > MAX_FILES) {
      return ApiErrors.badRequest(`Maximum ${MAX_FILES} files allowed per upload`);
    }

    // Validate each file
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return ApiErrors.badRequest(`File ${file.name} exceeds maximum size of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      }

      if (!file.type.startsWith('image/')) {
        return ApiErrors.badRequest(`File ${file.name} must be an image`);
      }
    }

    // Upload files and create records
    const uploadResults = [];

    for (const file of files) {
      try {
        // Upload to Supabase Storage
        const imageUrl = await uploadToSupabaseStorage(supabase, file, profile.id, week);

        // Extract file_path from image_url
        const url = new URL(imageUrl);
        const pathParts = url.pathname.split('/');
        const bucketIndex = pathParts.findIndex((part) => part === 'focus-group-uploads');
        const filePath = bucketIndex !== -1 
          ? pathParts.slice(bucketIndex + 1).join('/')
          : imageUrl;

        // Create database record in focus_group_uploads table
        const { data: uploadRecord, error: insertError } = await supabase
          .from('focus_group_uploads')
          .insert({
            profile_id: profile.id,
            week_number: week,
            image_url: imageUrl,
            consent_given: true, // Default to true for focus group uploads
            verified_by_admin: false,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Insert error details:', JSON.stringify(insertError));
          throw new Error(`Database insert failed: ${insertError.message}`);
        }

        uploadResults.push({
          ...uploadRecord,
          week: uploadRecord.week_number,
          file_path: filePath,
          user_id: user.id,
        });
      } catch (uploadError: unknown) {
        const errorMessage = uploadError instanceof Error ? uploadError.message : String(uploadError);
        console.error(`Upload processing failed for file ${file.name}:`, errorMessage);
        // Continue with other files even if one fails
        continue;
      }
    }

    if (uploadResults.length === 0) {
      console.error('All file uploads failed. See logs above for specific errors.');
      return ApiErrors.internalError('Failed to upload files. Please check your connection and try again.');
    }

    return successResponse(uploadResults, 201, 'Files uploaded successfully');
  } catch (error: unknown) {
    console.error('Upload submission error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return ApiErrors.internalError('Internal server error', message);
  }
}

