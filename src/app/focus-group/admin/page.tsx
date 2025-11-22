'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFocusGroup } from '../context/FocusGroupContext';
import { createClientSupabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import ParticipantTable from './components/ParticipantTable';
import FeedbackTable from './components/FeedbackTable';
import MessageManagement from './components/MessageManagement';
import { Card, CardContent } from '@/components/ui/Card';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type FeedbackRow = Database['public']['Tables']['focus_group_feedback']['Row'];
type UploadRow = Database['public']['Tables']['focus_group_uploads']['Row'];

export default function FocusGroupAdmin() {
  const router = useRouter();
  const { isAdmin: contextIsAdmin, isLoading: isContextLoading } = useFocusGroup();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [uploads, setUploads] = useState<UploadRow[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'messages' | 'feedback' | 'uploads'>('overview');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Start with context admin status (from server-side layout)
        // This is more reliable than client-side checks which can fail due to CORS
        let confirmedIsAdmin = contextIsAdmin;
        
        const supabase = createClientSupabase();

        // Get current user (auth already verified by server-side layout)
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

        if (userError || !currentUser) {
          console.error('[Admin Page] Auth error:', userError);
          // If context says we're admin, trust it even if client-side auth fails
          if (contextIsAdmin) {
            confirmedIsAdmin = true;
            // Continue loading data even if client-side auth fails
          } else {
            setError('Failed to load user');
            setIsAdmin(false);
            setCheckingAdmin(false);
            setLoading(false);
            return;
          }
        } else {
          setUser(currentUser);

          // Directly check admin status from database (more reliable than context)
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('user_id', currentUser.id)
            .maybeSingle();

          if (profileError) {
            console.error('[Admin Page] Profile fetch error:', profileError);
            // Trust context if database query fails
            confirmedIsAdmin = contextIsAdmin;
          } else {
            const directIsAdmin = profileData?.is_admin === true;
            confirmedIsAdmin = directIsAdmin || contextIsAdmin;
            console.log('[Admin Page] Admin Check:', {
              is_admin: profileData?.is_admin,
              directIsAdmin,
              contextIsAdmin,
              finalIsAdmin: confirmedIsAdmin
            });
          }
        }

        // Set admin status
        setIsAdmin(confirmedIsAdmin);
        setCheckingAdmin(false);

        // Only load admin data if we're confirmed as admin
        if (!confirmedIsAdmin) {
          console.log('[Admin Page] Not admin, skipping data load');
          setLoading(false);
          return;
        }

        // Load all participant profiles (including status and current_week)
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profilesError) {
          console.error('Error loading profiles:', profilesError);
          setError('Failed to load profiles');
          setLoading(false);
          return;
        }

        // Load all feedback entries from focus_group_feedback table
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('focus_group_feedback')
          .select('*')
          .order('created_at', { ascending: false });

        if (feedbackError) {
          console.error('Error loading feedback:', feedbackError);
          setError('Failed to load feedback');
          setLoading(false);
          return;
        }

        // Load all uploads from focus_group_uploads table
        const { data: uploadsData, error: uploadsError } = await supabase
          .from('focus_group_uploads')
          .select('*')
          .order('created_at', { ascending: false });

        if (uploadsError) {
          console.error('Error loading uploads:', uploadsError);
          // Don't fail completely if uploads fail
        }

        setProfiles((profilesData || []) as ProfileRow[]);
        setFeedback((feedbackData || []) as FeedbackRow[]);
        setUploads((uploadsData || []) as UploadRow[]);

        // Load unread message counts for each participant
        const participantUserIds = (profilesData || [])
          .filter((p) => !p.is_admin)
          .map((p) => p.user_id);

        const counts: Record<string, number> = {};
        if (participantUserIds.length > 0) {
          const { data: messagesData } = await supabase
            .from('focus_group_messages')
            .select('recipient_id')
            .in('recipient_id', participantUserIds)
            .eq('sender_role', 'admin')
            .eq('is_read', false);

          if (messagesData) {
            messagesData.forEach((msg) => {
              const userId = msg.recipient_id;
              counts[userId] = (counts[userId] || 0) + 1;
            });
          }
        }
        setUnreadCounts(counts);
        setLoading(false);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
        setLoading(false);
      }
    };

    loadData();
  }, [router, contextIsAdmin]);

  if (loading || isContextLoading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#0F2C1C] text-lg">Loading dashboard...</p>
          <p className="text-xs text-gray-500 mt-2">Checking admin status...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    console.log('[Admin Page] Access Denied - isAdmin is false', { isAdmin, checkingAdmin, contextIsAdmin });
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F5F3]">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full mx-4">
          <h1 className="text-2xl font-primary font-bold text-red-800 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You do not have administrative privileges to access this dashboard.
          </p>
          <div className="text-xs text-left bg-gray-100 p-3 rounded mb-4">
            <p><strong>Debug Info:</strong></p>
            <p>isAdmin: {String(isAdmin)}</p>
            <p>checkingAdmin: {String(checkingAdmin)}</p>
            <p>contextIsAdmin: {String(contextIsAdmin)}</p>
            <p className="mt-2 text-blue-600">Check browser console for detailed logs</p>
          </div>
          <Link
            href="/focus-group/feedback"
            className="inline-block w-full px-6 py-3 bg-[#0E2A22] text-white rounded-lg hover:bg-[#1a4d3d] transition-colors font-medium"
          >
            Return to Feedback
          </Link>
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

  // Calculate statistics
  const participantProfiles = profiles; // Show all profiles including admins
  const totalParticipants = participantProfiles.length;
  const totalFeedbackEntries = feedback.length;
  const totalUploads = uploads.length;
  const avgSatisfaction =
    feedback.length > 0
      ? (
          feedback.reduce((acc, f) => acc + (f.overall_rating || 0), 0) / feedback.length
        ).toFixed(1)
      : '0.0';

  // Calculate feedback and upload counts per user
  const feedbackCounts: Record<string, number> = {};
  feedback.forEach((f) => {
    // Get user_id from profile_id
    const profile = profiles.find((p) => p.id === f.profile_id);
    if (profile) {
      feedbackCounts[profile.user_id] = (feedbackCounts[profile.user_id] || 0) + 1;
    }
  });

  const uploadCounts: Record<string, number> = {};
  uploads.forEach((u) => {
    // Get user_id from profile_id
    const profile = profiles.find((p) => p.id === u.profile_id);
    if (profile) {
      uploadCounts[profile.user_id] = (uploadCounts[profile.user_id] || 0) + 1;
    }
  });


  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'participants', label: 'Participants' },
    { id: 'messages', label: 'Messages' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'uploads', label: 'Uploads' },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold text-[#0E2A22] mb-2">
          Focus Group Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome, {user?.email}. Manage participants, view feedback, and communicate with users.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-[#C9A66B] text-[#0E2A22]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Total Participants</h3>
                <p className="text-3xl font-bold text-[#0E2A22]">{totalParticipants}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Total Feedback</h3>
                <p className="text-3xl font-bold text-[#0E2A22]">{totalFeedbackEntries}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Total Uploads</h3>
                <p className="text-3xl font-bold text-[#0E2A22]">{totalUploads}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Avg. Satisfaction</h3>
                <p className="text-3xl font-bold text-[#0E2A22]">{avgSatisfaction}/10</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-[#0E2A22] mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/focus-group/admin/uploads"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium text-[#0E2A22] mb-1">View All Uploads</h3>
                  <p className="text-sm text-gray-600">Browse participant image uploads</p>
                </Link>
                <button
                  onClick={() => setActiveTab('messages')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <h3 className="font-medium text-[#0E2A22] mb-1">Send Messages</h3>
                  <p className="text-sm text-gray-600">Communicate with participants</p>
                </button>
                <button
                  onClick={() => setActiveTab('participants')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <h3 className="font-medium text-[#0E2A22] mb-1">Manage Participants</h3>
                  <p className="text-sm text-gray-600">View and manage participant profiles</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'participants' && (
        <ParticipantTable
          profiles={profiles}
          feedbackCounts={feedbackCounts}
          uploadCounts={uploadCounts}
        />
      )}

      {activeTab === 'messages' && (
        <MessageManagement profiles={profiles} unreadCounts={unreadCounts} />
      )}

      {activeTab === 'feedback' && <FeedbackTable feedback={feedback} profiles={profiles} />}

      {activeTab === 'uploads' && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-[#0E2A22] mb-4">Upload Management</h2>
              <p className="text-gray-600 mb-6">
                View and manage all participant image uploads
              </p>
              <Link
                href="/focus-group/admin/uploads"
                className="inline-block px-6 py-3 bg-[#C9A66B] text-white rounded-lg hover:bg-[#E7C686] transition-colors font-medium"
              >
                Go to Uploads Page
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
