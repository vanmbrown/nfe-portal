/**
 * Supabase Storage Helper for Focus Group Uploads
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const BUCKET_NAME = 'focus-group-uploads';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Upload file to Supabase Storage
 * @param supabase - Supabase client instance (server-side)
 * @param file - File object to upload
 * @param profileId - Profile ID for folder structure
 * @param weekNumber - Week number for file naming
 * @returns Public URL of uploaded file
 */
export async function uploadToSupabaseStorage(
  supabase: SupabaseClient<Database>,
  file: File,
  profileId: string,
  weekNumber: number
): Promise<string> {

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Generate unique filename
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `week-${weekNumber}-${timestamp}.${fileExt}`;
  const filePath = `${profileId}/${fileName}`;

  // Upload file
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get public URL (will be signed URL for private bucket)
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

/**
 * Get signed URL for private image
 * @param supabase - Supabase client instance (server-side)
 * @param imageUrl - Full URL or path to image
 * @returns Signed URL valid for 1 hour
 */
export async function getSignedUrl(
  supabase: SupabaseClient<Database>,
  imageUrl: string
): Promise<string> {

  // Extract path from full URL if needed
  const url = new URL(imageUrl);
  const pathParts = url.pathname.split('/');
  const bucketIndex = pathParts.findIndex((part) => part === BUCKET_NAME);
  
  if (bucketIndex === -1) {
    // Assume it's already a path
    const path = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, 3600); // 1 hour expiry

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  // Extract path after bucket name
  const path = pathParts.slice(bucketIndex + 1).join('/');
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, 3600); // 1 hour expiry

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Delete file from Supabase Storage
 * @param supabase - Supabase client instance (server-side)
 * @param imageUrl - Full URL or path to image
 */
export async function deleteFromSupabaseStorage(
  supabase: SupabaseClient<Database>,
  imageUrl: string
): Promise<void> {

  // Extract path from full URL if needed
  const url = new URL(imageUrl);
  const pathParts = url.pathname.split('/');
  const bucketIndex = pathParts.findIndex((part) => part === BUCKET_NAME);
  
  if (bucketIndex === -1) {
    // Assume it's already a path
    const path = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
    return;
  }

  // Extract path after bucket name
  const path = pathParts.slice(bucketIndex + 1).join('/');
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

