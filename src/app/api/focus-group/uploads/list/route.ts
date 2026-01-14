import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase as createServerSupabaseClient } from '@/lib/supabase/server';
import { getSignedUrl } from '@/lib/storage/supabase-storage';
import { successResponse, ApiErrors } from '@/lib/api/response';

/**
 * GET /api/focus-group/uploads/list?week={week}
 * Retrieve uploads for a specific week for the current user
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

    // Get week from query params
    const { searchParams } = new URL(req.url);
    const weekParam = searchParams.get('week');
    
    if (!weekParam) {
      return ApiErrors.badRequest('Week parameter is required');
    }

    const week = parseInt(weekParam, 10);
    if (isNaN(week) || week < 1 || week > 52) {
      return ApiErrors.badRequest('Week must be a number between 1 and 52');
    }

    // Get user's profile to find profile_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile) {
      return ApiErrors.notFound('Profile not found. Please complete your profile first.');
    }

    // Get uploads for this week from focus_group_uploads table
    const { data: uploads, error: fetchError } = await supabase
      .from('focus_group_uploads')
      .select('*')
      .eq('profile_id', profile.id)
      .eq('week_number', week)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return ApiErrors.internalError('Failed to fetch uploads', fetchError.message);
    }

    // Generate signed URLs for private images
    const uploadsWithSignedUrls = await Promise.all(
      (uploads || []).map(async (upload) => {
        try {
          const imageUrl = upload.image_url;
          if (!imageUrl || typeof imageUrl !== 'string') {
            return {
              ...upload,
              week: upload.week_number,
              file_path: imageUrl || '',
              user_id: user.id,
            };
          }

          const signedUrl = await getSignedUrl(supabase, imageUrl);
          
          // Extract file_path from image_url (path after bucket name)
          const url = new URL(imageUrl);
          const pathParts = url.pathname.split('/');
          const bucketIndex = pathParts.findIndex((part) => part === 'focus-group-uploads');
          const filePath = bucketIndex !== -1 
            ? pathParts.slice(bucketIndex + 1).join('/')
            : imageUrl;

          return {
            ...upload,
            week: upload.week_number,
            file_path: filePath,
            signed_url: signedUrl,
            user_id: user.id,
          };
        } catch (error) {
          console.error('Error generating signed URL:', error);
          const imageUrl = upload.image_url || '';
          return {
            ...upload,
            week: upload.week_number,
            file_path: imageUrl,
            signed_url: imageUrl, // Fallback to original URL
            user_id: user.id,
          };
        }
      })
    );

    return successResponse(uploadsWithSignedUrls);
  } catch (error: unknown) {
    console.error('Uploads fetch error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return ApiErrors.internalError('Internal server error', message);
  }
}

