'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

interface Profile {
  id: string;
  user_id: string;
  age_range: string | null;
  top_concerns: string[] | null;
  created_at: string;
  is_admin?: boolean;
  email?: string | null;
}

interface Feedback {
  id: string;
  user_id: string;
  week_number: number;
  hydration_rating: number;
  tone_rating: number;
  texture_rating: number;
  overall_rating: number;
  notes: string | null;
  created_at: string;
}

interface ProfileWithFeedback extends Profile {
  totalFeedback: number;
  latestRating: number | null;
  lastSubmitted: string;
  email: string | null;
}

export default function FocusGroupAdmin() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const supabase = createClientSupabase();

        // Get current user
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

        if (userError || !currentUser) {
          router.push('/focus-group/login');
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
          // Not an admin, redirect to home
          router.push('/focus-group/feedback');
          return;
        }

        // Load all participant profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, user_id, age_range, top_concerns, created_at')
          .order('created_at', { ascending: false });

        if (profilesError) {
          console.error('Error loading profiles:', profilesError);
          setError('Failed to load profiles');
          setLoading(false);
          return;
        }

        // Load all feedback entries
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('feedback')
          .select('id, user_id, week, hydration_rating, tone_rating, texture_rating, overall_rating, notes, created_at')
          .order('created_at', { ascending: false });

        if (feedbackError) {
          console.error('Error loading feedback:', feedbackError);
          setError('Failed to load feedback');
          setLoading(false);
          return;
        }

        // Note: Email retrieval requires server-side admin access
        // For now, we'll show user_id. To show emails, either:
        // 1. Store email in profiles table when creating profile
        // 2. Create a server-side API route with admin access
        // For now, profiles don't have email field, so we'll show user_id
        const profilesWithEmails = (profilesData || []).map((profile) => ({
          ...profile,
          email: null, // Email not available in profiles table
        }));

        setProfiles(profilesWithEmails as unknown as Profile[]);
        setFeedback(
          (feedbackData || []).map((f) => ({
            ...f,
            week_number: f.week,
          })) as unknown as Feedback[]
        );
        setLoading(false);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#0F2C1C] text-lg">Loading dashboard...</p>
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
            onClick={() => router.push('/focus-group/feedback')}
            className="px-4 py-2 bg-[#0F2C1C] text-white rounded hover:bg-[#2A4C44] transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Merge feedback summary into profiles for easy viewing
  const profilesWithFeedback: ProfileWithFeedback[] = profiles.map((p) => {
    const userFeedback = feedback.filter((f) => f.user_id === p.user_id);
    const latestFeedback = userFeedback[0];
    const avgRating = userFeedback.length > 0
      ? userFeedback.reduce((sum, f) => sum + f.overall_rating, 0) / userFeedback.length
      : null;

    return {
      ...p,
      totalFeedback: userFeedback.length,
      latestRating: latestFeedback?.overall_rating || null,
      lastSubmitted: latestFeedback?.created_at
        ? new Date(latestFeedback.created_at).toLocaleDateString()
        : 'No submissions yet',
      email: p.email || null,
    };
  });

  // Calculate summary statistics
  const totalParticipants = profiles.length;
  const totalFeedbackEntries = feedback.length;
  const avgSatisfaction = feedback.length > 0
    ? (feedback.reduce((acc, f) => acc + f.overall_rating, 0) / feedback.length).toFixed(1)
    : '0.0';

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-semibold text-[#0F2C1C] mb-2">
              Focus Group Admin Dashboard
            </h1>
            <p className="text-[#0F2C1C] text-base md:text-lg">
              Welcome, {user?.email}. You have administrative access.
            </p>
          </div>
          <a
            href="/focus-group/admin/uploads"
            className="px-4 py-2 bg-[#0F2C1C] text-white rounded-lg hover:bg-[#2A4C44] transition font-medium"
          >
            View Uploads
          </a>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0F2C1C] text-white p-6 rounded-lg text-center shadow-md">
          <h3 className="text-sm md:text-base font-serif mb-2">Total Participants</h3>
          <p className="text-3xl md:text-4xl font-bold">{totalParticipants}</p>
        </div>
        <div className="bg-[#0F2C1C] text-white p-6 rounded-lg text-center shadow-md">
          <h3 className="text-sm md:text-base font-serif mb-2">Total Feedback Entries</h3>
          <p className="text-3xl md:text-4xl font-bold">{totalFeedbackEntries}</p>
        </div>
        <div className="bg-[#0F2C1C] text-white p-6 rounded-lg text-center shadow-md">
          <h3 className="text-sm md:text-base font-serif mb-2">Avg. Satisfaction</h3>
          <p className="text-3xl md:text-4xl font-bold">
            {avgSatisfaction}/5
          </p>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm md:text-base">
            <thead className="bg-[#0F2C1C] text-white">
              <tr>
                <th className="p-3 md:p-4 text-left font-serif font-semibold">User ID</th>
                <th className="p-3 md:p-4 text-left font-serif font-semibold">Age Range</th>
                <th className="p-3 md:p-4 text-left font-serif font-semibold">Top Concerns</th>
                <th className="p-3 md:p-4 text-left font-serif font-semibold">Joined</th>
                <th className="p-3 md:p-4 text-left font-serif font-semibold">Feedback Entries</th>
                <th className="p-3 md:p-4 text-left font-serif font-semibold">Latest Rating</th>
                <th className="p-3 md:p-4 text-left font-serif font-semibold">Last Submission</th>
              </tr>
            </thead>
            <tbody>
              {profilesWithFeedback.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No participants yet.
                  </td>
                </tr>
              ) : (
                profilesWithFeedback.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3 md:p-4 text-[#0F2C1C] font-mono text-xs">
                      {p.user_id.slice(0, 8)}...
                    </td>
                    <td className="p-3 md:p-4 text-[#0F2C1C]">
                      {p.age_range || 'N/A'}
                    </td>
                    <td className="p-3 md:p-4 text-[#0F2C1C]">
                      {p.top_concerns && p.top_concerns.length > 0
                        ? p.top_concerns.slice(0, 2).join(', ') + (p.top_concerns.length > 2 ? '...' : '')
                        : 'N/A'}
                    </td>
                    <td className="p-3 md:p-4 text-[#0F2C1C]">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 md:p-4 text-[#0F2C1C] font-medium">
                      {p.totalFeedback}
                    </td>
                    <td className="p-3 md:p-4 text-[#0F2C1C]">
                      {p.latestRating !== null ? `${p.latestRating}/5` : 'N/A'}
                    </td>
                    <td className="p-3 md:p-4 text-[#0F2C1C]">
                      {p.lastSubmitted}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feedback Details Section */}
      {feedback.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-[#0F2C1C] text-white p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-serif font-semibold">Recent Feedback Entries</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm md:text-base">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 md:p-4 text-left font-serif font-semibold text-[#0F2C1C]">Week</th>
                  <th className="p-3 md:p-4 text-left font-serif font-semibold text-[#0F2C1C]">Hydration</th>
                  <th className="p-3 md:p-4 text-left font-serif font-semibold text-[#0F2C1C]">Tone</th>
                  <th className="p-3 md:p-4 text-left font-serif font-semibold text-[#0F2C1C]">Texture</th>
                  <th className="p-3 md:p-4 text-left font-serif font-semibold text-[#0F2C1C]">Overall</th>
                  <th className="p-3 md:p-4 text-left font-serif font-semibold text-[#0F2C1C]">Date</th>
                </tr>
              </thead>
              <tbody>
                {feedback.slice(0, 20).map((f) => (
                  <tr
                    key={f.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3 md:p-4 text-[#0F2C1C]">Week {f.week_number}</td>
                    <td className="p-3 md:p-4 text-[#0F2C1C]">{f.hydration_rating}/5</td>
                    <td className="p-3 md:p-4 text-[#0F2C1C]">{f.tone_rating}/5</td>
                    <td className="p-3 md:p-4 text-[#0F2C1C]">{f.texture_rating}/5</td>
                    <td className="p-3 md:p-4 text-[#0F2C1C] font-medium">{f.overall_rating}/5</td>
                    <td className="p-3 md:p-4 text-[#0F2C1C]">
                      {new Date(f.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {feedback.length > 20 && (
              <div className="p-4 text-center text-gray-500 text-sm">
                Showing 20 of {feedback.length} entries
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
