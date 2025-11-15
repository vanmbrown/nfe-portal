/**
 * Admin Storage Helper for Focus Group Uploads Viewer
 * Allows admins to list and view all uploaded images
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const BUCKET_NAME = 'focus-group-uploads';

export interface UploadFile {
  user_id: string;
  file_name: string;
  file_path: string;
  signed_url?: string;
  public_url?: string;
  size?: number;
  created_at?: string;
}

/**
 * Get all uploaded files from focus-group-uploads bucket
 * Groups files by user_id (folder name)
 */
export async function getAllFocusGroupUploads(
  supabase: SupabaseClient<Database>
): Promise<UploadFile[]> {
  try {
    // List all folders (each folder is a user_id)
    const { data: folders, error: foldersError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (foldersError) {
      console.error('Error listing folders:', foldersError);
      throw new Error(`Failed to list folders: ${foldersError.message}`);
    }

    if (!folders || folders.length === 0) {
      return [];
    }

    const allUploads: UploadFile[] = [];

    // Iterate through each folder (user_id)
    for (const folder of folders) {
      // Skip if it's a file (has metadata) - folders don't have metadata
      if (folder.metadata) continue;

      const userId = folder.name;

      // List all files in this user's folder
      const { data: files, error: filesError } = await supabase.storage
        .from(BUCKET_NAME)
        .list(userId, {
          limit: 1000,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (filesError) {
        console.error(`Error listing files for user ${userId}:`, filesError);
        // Continue with other folders even if one fails
        continue;
      }

      if (!files) continue;

      // Process each file
      for (const file of files) {
        // Skip if it's a folder (no metadata) - files have metadata
        if (!file.metadata) continue;

        const filePath = `${userId}/${file.name}`;

        // Generate signed URL (valid for 1 hour)
        const { data: signedUrlData, error: urlError } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(filePath, 3600);

        if (urlError) {
          console.error(`Error generating signed URL for ${filePath}:`, urlError);
          // Continue without signed URL
        }

        allUploads.push({
          user_id: userId,
          file_name: file.name,
          file_path: filePath,
          signed_url: signedUrlData?.signedUrl,
          size: file.metadata?.size,
          created_at: file.created_at,
        });
      }
    }

    return allUploads;
  } catch (error: unknown) {
    console.error('Error getting all uploads:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to get uploads: ${message}`);
  }
}

/**
 * Get uploads grouped by user_id
 */
export function groupUploadsByUser(uploads: UploadFile[]): Record<string, UploadFile[]> {
  return uploads.reduce((acc, upload) => {
    if (!acc[upload.user_id]) {
      acc[upload.user_id] = [];
    }
    acc[upload.user_id].push(upload);
    return acc;
  }, {} as Record<string, UploadFile[]>);
}

/**
 * Extract week number from filename
 * Format: week-{week_number}-{timestamp}.{ext}
 */
export function extractWeekFromFilename(filename: string): number | null {
  const match = filename.match(/week-(\d+)-/);
  return match ? parseInt(match[1], 10) : null;
}

