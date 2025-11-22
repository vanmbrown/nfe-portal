'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClientSupabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import {
  getAllFocusGroupUploads,
  groupUploadsByUser,
  extractWeekFromFilename,
  type UploadFile,
} from '@/lib/storage/admin-storage';
import { Download, ExternalLink, Image as ImageIcon } from 'lucide-react';

interface Profile {
  user_id: string;
  age_range: string | null;
  top_concerns: string[] | null;
}

export default function AdminUploadsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const supabase = createClientSupabase();

        // Get current user
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

        if (userError || !currentUser) {
          router.push('/login');
          return;
        }

        setUser(currentUser);

        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          // @ts-ignore - Supabase type inference limitation with user_id filter
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error checking admin status:', profileError);
          setError('Failed to verify admin access');
          setLoading(false);
          return;
        }

        if (!profile || !('is_admin' in profile) || !profile.is_admin) {
          // Not an admin, redirect
          router.push('/focus-group/feedback');
          return;
        }

        // Load all uploads
        // @ts-ignore - Supabase type inference limitation
        const allUploads = await getAllFocusGroupUploads(supabase);
        setUploads(allUploads);

        // Load profiles for user info
        const userIds = Array.from(new Set(allUploads.map(u => u.user_id)));
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('user_id, age_range, top_concerns')
            // @ts-ignore - Supabase type inference limitation with user_id filter
            .in('user_id', userIds);

          if (profilesData) {
            type ProfileRow = Database['public']['Tables']['profiles']['Row'];
            const profilesMap = (profilesData as ProfileRow[])
              .filter((p): p is ProfileRow => p !== null && typeof p === 'object' && 'user_id' in p)
              .reduce((acc, p) => {
                acc[p.user_id] = p as unknown as Profile;
                return acc;
              }, {} as Record<string, Profile>);
            setProfiles(profilesMap);
          }
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Unexpected error:', err);
        setError(err.message || 'An unexpected error occurred');
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#0F2C1C] text-lg">Loading uploads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => router.push('/focus-group/admin')}
            className="px-4 py-2 bg-[#0F2C1C] text-white rounded hover:bg-[#2A4C44] transition"
          >
            Go Back to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  const groupedUploads = groupUploadsByUser(uploads);
  const userIds = Object.keys(groupedUploads).sort();

  const handleDownload = async (upload: UploadFile) => {
    if (!upload.signed_url) return;
    
    try {
      const response = await fetch(upload.signed_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = upload.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download image');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-semibold text-[#0F2C1C] mb-2">
              Focus Group Uploads Viewer
            </h1>
            <p className="text-[#0F2C1C] text-base md:text-lg">
              View all participant-uploaded images
            </p>
          </div>
          <a
            href="/focus-group/admin"
            className="text-[#0F2C1C] hover:text-[#D4AF37] transition underline"
          >
            ← Back to Dashboard
          </a>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#0F2C1C] text-white p-6 rounded-lg text-center shadow-md">
            <h3 className="text-sm md:text-base font-serif mb-2">Total Users</h3>
            <p className="text-3xl md:text-4xl font-bold">{userIds.length}</p>
          </div>
          <div className="bg-[#0F2C1C] text-white p-6 rounded-lg text-center shadow-md">
            <h3 className="text-sm md:text-base font-serif mb-2">Total Images</h3>
            <p className="text-3xl md:text-4xl font-bold">{uploads.length}</p>
          </div>
          <div className="bg-[#0F2C1C] text-white p-6 rounded-lg text-center shadow-md">
            <h3 className="text-sm md:text-base font-serif mb-2">Avg. per User</h3>
            <p className="text-3xl md:text-4xl font-bold">
              {userIds.length > 0 ? Math.round(uploads.length / userIds.length) : 0}
            </p>
          </div>
        </div>
      </div>

      {/* User Filter (Optional) */}
      {userIds.length > 1 && (
        <div className="mb-6">
          <label htmlFor="user-filter" className="block text-sm font-medium text-[#0F2C1C] mb-2">
            Filter by User:
          </label>
          <select
            id="user-filter"
            value={selectedUserId || ''}
            onChange={(e) => setSelectedUserId(e.target.value || null)}
            className="w-full md:w-64 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          >
            <option value="">All Users</option>
            {userIds.map((uid) => (
              <option key={uid} value={uid}>
                {uid.slice(0, 8)}... ({groupedUploads[uid].length} images)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Uploads by User */}
      {userIds.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No uploads found</p>
        </div>
      ) : (
        <div className="space-y-8">
          {(selectedUserId ? [selectedUserId] : userIds).map((userId) => {
            const userUploads = groupedUploads[userId];
            const profile = profiles[userId];
            const weekGroups: Record<number, UploadFile[]> = {};

            // Group by week number
            userUploads.forEach((upload) => {
              const week = extractWeekFromFilename(upload.file_name) || 0;
              if (!weekGroups[week]) {
                weekGroups[week] = [];
              }
              weekGroups[week].push(upload);
            });

            return (
              <div key={userId} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-[#0F2C1C] text-white p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl md:text-2xl font-serif font-semibold mb-2">
                        User: {userId.slice(0, 8)}...
                      </h2>
                      {profile && (
                        <div className="text-sm text-gray-200">
                          {profile.age_range && <span>Age: {profile.age_range} • </span>}
                          <span>{userUploads.length} image{userUploads.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 md:p-6">
                  {/* Group by Week */}
                  {Object.keys(weekGroups).length > 0 ? (
                    <div className="space-y-6">
                      {Object.entries(weekGroups)
                        .sort(([a], [b]) => parseInt(b) - parseInt(a))
                        .map(([week, weekUploads]) => (
                          <div key={week}>
                            <h3 className="text-lg font-semibold text-[#0F2C1C] mb-4">
                              Week {week === '0' ? 'Unknown' : week} ({weekUploads.length} image{weekUploads.length !== 1 ? 's' : ''})
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {weekUploads.map((upload, idx) => (
                                <div
                                  key={`${upload.file_path}-${idx}`}
                                  className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 hover:shadow-md transition-shadow"
                                >
                                  <div className="relative aspect-square bg-gray-100">
                                    {upload.signed_url ? (
                                      <Image
                                        src={upload.signed_url}
                                        alt={upload.file_name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.src = '';
                                          target.parentElement!.innerHTML = `
                                            <div class="w-full h-full flex items-center justify-center">
                                              <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                              </svg>
                                            </div>
                                          `;
                                        }}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="w-12 h-12 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="p-3">
                                    <p className="text-xs text-gray-600 truncate mb-2" title={upload.file_name}>
                                      {upload.file_name}
                                    </p>
                                    <div className="flex gap-2">
                                      <a
                                        href={upload.signed_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-[#0F2C1C] text-white rounded hover:bg-[#2A4C44] transition"
                                      >
                                        <ExternalLink size={14} />
                                        View
                                      </a>
                                      <button
                                        onClick={() => handleDownload(upload)}
                                        disabled={!upload.signed_url}
                                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs border border-[#0F2C1C] text-[#0F2C1C] rounded hover:bg-[#0F2C1C] hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <Download size={14} />
                                        Download
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No images found for this user
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

