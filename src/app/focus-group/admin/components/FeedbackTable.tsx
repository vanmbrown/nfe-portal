'use client';

import React from 'react';
import Link from 'next/link';
import type { Database } from '@/types/supabase';

type FeedbackRow = Database['public']['Tables']['focus_group_feedback']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface FeedbackTableProps {
  feedback: FeedbackRow[];
  profiles: ProfileRow[];
  maxRows?: number;
}

export default function FeedbackTable({ feedback, profiles, maxRows = 20 }: FeedbackTableProps) {
  const displayFeedback = maxRows > 0 ? feedback.slice(0, maxRows) : feedback;
  
  // Create a map of profile_id -> user_id for quick lookup
  const profileToUserMap = new Map<string, string>();
  profiles.forEach((p) => {
    profileToUserMap.set(p.id, p.user_id);
  });

  if (feedback.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
        No feedback entries yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-[#0E2A22] text-white p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-semibold">
          Recent Feedback Entries {maxRows > 0 && feedback.length > maxRows && `(Showing ${maxRows} of ${feedback.length})`}
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm md:text-base">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 md:p-4 text-left font-semibold text-[#0E2A22]">Week</th>
              <th className="p-3 md:p-4 text-left font-semibold text-[#0E2A22]">User ID</th>
              <th className="p-3 md:p-4 text-left font-semibold text-[#0E2A22]">Overall Rating</th>
              <th className="p-3 md:p-4 text-left font-semibold text-[#0E2A22]">Product Usage</th>
              <th className="p-3 md:p-4 text-left font-semibold text-[#0E2A22]">Perceived Changes</th>
              <th className="p-3 md:p-4 text-left font-semibold text-[#0E2A22]">Date</th>
            </tr>
          </thead>
          <tbody>
            {displayFeedback.map((f) => (
              <tr
                key={f.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="p-3 md:p-4 text-[#0E2A22] font-medium">
                  Week {f.week_number}
                </td>
                <td className="p-3 md:p-4 text-[#0E2A22] font-mono text-xs">
                  <Link 
                    href={`/focus-group/admin/participant/${profileToUserMap.get(f.profile_id) || f.profile_id}`}
                    className="text-[#C9A66B] hover:text-[#E7C686] hover:underline"
                  >
                    {profileToUserMap.get(f.profile_id)?.slice(0, 8) || f.profile_id.slice(0, 8)}...
                  </Link>
                </td>
                <td className="p-3 md:p-4 text-[#0E2A22]">
                  {f.overall_rating ? `${f.overall_rating}/10` : 'N/A'}
                </td>
                <td className="p-3 md:p-4 text-[#0E2A22]">
                  {f.product_usage
                    ? f.product_usage.length > 50
                      ? `${f.product_usage.slice(0, 50)}...`
                      : f.product_usage
                    : 'N/A'}
                </td>
                <td className="p-3 md:p-4 text-[#0E2A22]">
                  {f.perceived_changes
                    ? f.perceived_changes.length > 50
                      ? `${f.perceived_changes.slice(0, 50)}...`
                      : f.perceived_changes
                    : 'N/A'}
                </td>
                <td className="p-3 md:p-4 text-[#0E2A22]">
                  {f.created_at
                    ? new Date(f.created_at).toLocaleDateString()
                    : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

