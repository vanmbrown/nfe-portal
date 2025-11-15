'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClientSupabase } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/Card';
import { Image as ImageIcon, Calendar } from 'lucide-react';
import type { FocusGroupUpload } from '@/types/focus-group';

interface UploadGalleryProps {
  className?: string;
}

interface UploadWithSignedUrl {
  id: string;
  user_id: string;
  type?: string;
  filename?: string;
  url?: string;
  image_url?: string; // For backward compatibility
  mime_type?: string;
  size?: number;
  image_consent?: boolean;
  marketing_consent?: boolean;
  created_at?: string;
  upload_date?: string; // For backward compatibility
  notes?: string;
  week_number?: number; // For backward compatibility
  signed_url?: string;
}

export default function UploadGallery({ className }: UploadGalleryProps) {
  const [uploads, setUploads] = useState<UploadWithSignedUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUploads = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get session token for authenticated request
        const supabase = createClientSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const response = await fetch('/api/focus-group/uploads', {
          headers,
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to load uploads');
        }

        setUploads(result.data || []);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load uploads';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadUploads();
  }, []);

  // Group uploads by week - extract week from filename or use created_at
  // Since images table doesn't have week_number, we'll group by date or use a default
  const uploadsByWeek = uploads.reduce((acc, upload) => {
    // Try to extract week from filename (format: week-{number}-{timestamp}.{ext})
    // Or group by month/week based on created_at
    let week = 1; // Default to week 1
    
    if (upload.filename) {
      const weekMatch = upload.filename.match(/week-(\d+)-/);
      if (weekMatch) {
        week = parseInt(weekMatch[1], 10);
      } else if (upload.created_at) {
        // Calculate week from created_at if available
        const uploadDate = new Date(upload.created_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - uploadDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        week = Math.ceil(diffDays / 7) || 1;
      }
    } else if (upload.created_at) {
      // Fallback: calculate week from created_at
      const uploadDate = new Date(upload.created_at);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - uploadDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      week = Math.ceil(diffDays / 7) || 1;
    }
    
    if (!acc[week]) {
      acc[week] = [];
    }
    acc[week].push(upload);
    return acc;
  }, {} as Record<number, UploadWithSignedUrl[]>);

  const weeks = Object.keys(uploadsByWeek)
    .map(Number)
    .sort((a, b) => a - b);

  if (loading) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500">Loading uploads...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-red-600">{error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (uploads.length === 0) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No uploads yet</h3>
              <p className="text-sm text-gray-500">
                Upload your first progress images to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Upload History</h2>
      <div className="space-y-8">
        {weeks.map((week) => {
          const weekUploads = uploadsByWeek[week];
          if (!weekUploads || weekUploads.length === 0) {
            return null;
          }
          return (
            <Card key={week}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-[#C9A66B]" />
                  <h3 className="text-lg font-semibold text-gray-900">Week {week}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {weekUploads.map((upload) => (
                  <div key={upload.id} className="space-y-2">
                    <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                      {upload.signed_url ? (
                        <Image
                          src={upload.signed_url}
                          alt={`Week ${week} upload`}
                          fill
                          className="object-cover"
                          unoptimized
                          onError={(e) => {
                            // Fallback if signed URL fails
                            const target = e.target as HTMLImageElement;
                            target.src = upload.url || upload.image_url || '';
                          }}
                        />
                      ) : upload.url || upload.image_url ? (
                        <Image
                          src={upload.url || upload.image_url || ''}
                          alt={`Week ${week} upload`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    {upload.notes && (
                      <p className="text-xs text-gray-600 line-clamp-2">{upload.notes}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {upload.created_at 
                        ? new Date(upload.created_at).toLocaleDateString()
                        : upload.upload_date 
                        ? new Date(upload.upload_date).toLocaleDateString()
                        : 'Date unknown'}
                    </p>
                  </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

