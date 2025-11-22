'use client';

import React from 'react';
import Link from 'next/link';
import { MessageCircle, User, Upload, FileText } from 'lucide-react';
import type { Database } from '@/types/supabase';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface ParticipantTableProps {
  profiles: ProfileRow[];
  feedbackCounts: Record<string, number>;
  uploadCounts: Record<string, number>;
}

export default function ParticipantTable({
  profiles,
  feedbackCounts,
  uploadCounts,
}: ParticipantTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm md:text-base">
          <thead className="bg-[#0E2A22] text-white">
            <tr>
              <th className="p-3 md:p-4 text-left font-semibold">User ID</th>
              <th className="p-3 md:p-4 text-left font-semibold">Status</th>
              <th className="p-3 md:p-4 text-left font-semibold">Current Week</th>
              <th className="p-3 md:p-4 text-left font-semibold">Age Range</th>
              <th className="p-3 md:p-4 text-left font-semibold">Top Concerns</th>
              <th className="p-3 md:p-4 text-left font-semibold">Joined</th>
              <th className="p-3 md:p-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  No participants yet.
                </td>
              </tr>
            ) : (
              profiles
                // .filter((p) => !p.is_admin) // Showing all profiles including admins for testing
                .map((p) => {
                  const status = (p.status as string) || 'onboard_pending';
                  const currentWeek = p.current_week || null;
                  const feedbackCount = feedbackCounts[p.user_id] || 0;
                  const uploadCount = uploadCounts[p.user_id] || 0;
                  const isAdmin = p.is_admin;

                  return (
                    <tr
                      key={p.id}
                      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                        isAdmin ? 'bg-yellow-50/30' : ''
                      }`}
                    >
                      <td className="p-3 md:p-4 text-[#0E2A22] font-mono text-xs">
                        {p.user_id.slice(0, 8)}...
                        {isAdmin && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1 rounded">Admin</span>}
                      </td>
                      <td className="p-3 md:p-4 text-[#0E2A22]">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            status === 'study_complete'
                              ? 'bg-green-100 text-green-800'
                              : status === 'week_active'
                              ? 'bg-blue-100 text-blue-800'
                              : status === 'profile_complete'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3 md:p-4 text-[#0E2A22]">
                        {currentWeek ? `Week ${currentWeek}` : 'N/A'}
                      </td>
                      <td className="p-3 md:p-4 text-[#0E2A22]">
                        {p.age_range || 'N/A'}
                      </td>
                      <td className="p-3 md:p-4 text-[#0E2A22]">
                        {p.top_concerns && Array.isArray(p.top_concerns) && p.top_concerns.length > 0
                          ? p.top_concerns.slice(0, 2).join(', ') +
                            (p.top_concerns.length > 2 ? '...' : '')
                          : 'N/A'}
                      </td>
                      <td className="p-3 md:p-4 text-[#0E2A22]">
                        {p.created_at
                          ? new Date(p.created_at).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="p-3 md:p-4 text-[#0E2A22]">
                        <div className="flex gap-2 items-center">
                          <Link
                            href={`/focus-group/messages?userId=${p.user_id}`}
                            className="p-1.5 hover:bg-[#C9A66B] hover:text-white rounded transition-colors"
                            title="Send Message"
                            aria-label="Send message to participant"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/focus-group/admin/participant/${p.user_id}`}
                            className="p-1.5 hover:bg-[#C9A66B] hover:text-white rounded transition-colors"
                            title="View Profile"
                            aria-label="View participant profile"
                          >
                            <User className="w-4 h-4" />
                          </Link>
                          <span className="text-xs text-gray-500" title={`${feedbackCount} feedback entries`}>
                            <FileText className="w-4 h-4 inline mr-1" />
                            {feedbackCount}
                          </span>
                          <span className="text-xs text-gray-500" title={`${uploadCount} uploads`}>
                            <Upload className="w-4 h-4 inline mr-1" />
                            {uploadCount}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
