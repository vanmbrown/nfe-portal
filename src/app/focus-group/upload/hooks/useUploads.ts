'use client';

import { useState, useCallback } from 'react';
import type { Database } from '@/types/supabase';

// Base type from generated Supabase types
type UploadRowBase = Database['public']['Tables']['focus_group_uploads']['Row'];

// Extended type for API normalization (handles both snake_case and camelCase)
interface UploadRow extends Partial<UploadRowBase> {
  id: string;
  user_id?: string;
  profile_id?: string;
  week: number;
  week_number?: number;
  file_path?: string;
  image_url?: string;
  signed_url?: string;
  created_at?: string | null;
  [key: string]: unknown;
}

interface UseUploadsReturn {
  uploads: UploadRow[];
  isLoading: boolean;
  listUploads: (week: number) => Promise<UploadRow[]>;
  uploadFiles: (files: File[], week: number) => Promise<void>;
  error: string | null;
}

export function useUploads(): UseUploadsReturn {
  const [uploads, setUploads] = useState<UploadRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // List uploads for a specific week
  const listUploads = useCallback(async (week: number): Promise<UploadRow[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // Get session token for authenticated request
      const { createClientSupabase } = await import('@/lib/supabase/client');
      const supabase = createClientSupabase();
      const { data: { session } } = await supabase.auth.getSession();

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/focus-group/uploads/list?week=${week}`, {
        headers,
        credentials: 'include', // Include cookies
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load uploads');
      }

      if (result.success && result.data) {
        // Normalize field names
        const normalized = (result.data as unknown[]).map((upload: unknown) => {
          const u = upload as Record<string, unknown>;
          return {
            ...u,
            week: u.week || u.week_number || week,
            file_path: u.file_path || u.image_url || '',
            user_id: u.user_id || undefined,
          } as UploadRow;
        });

        setUploads(normalized);
        return normalized;
      }

      setUploads([]);
      return [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load uploads';
      setError(message);
      console.error('Error loading uploads:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Upload files for a specific week
  const uploadFiles = useCallback(async (files: File[], week: number): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Get session token for authenticated request
      const { createClientSupabase } = await import('@/lib/supabase/client');
      const supabase = createClientSupabase();
      const { data: { session } } = await supabase.auth.getSession();

      const headers: HeadersInit = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('week', week.toString());

      const response = await fetch('/api/focus-group/uploads/upload', {
        method: 'POST',
        headers,
        credentials: 'include', // Include cookies
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload files');
      }

      if (result.success && result.data) {
        // Reload uploads for this week
        await listUploads(week);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload files';
      setError(message);
      console.error('Error uploading files:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [listUploads]);

  return {
    uploads,
    isLoading,
    listUploads,
    uploadFiles,
    error,
  };
}

