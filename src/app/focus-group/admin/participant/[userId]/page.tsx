'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClientSupabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Summary from '@/app/focus-group/profile/Summary';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type FeedbackRow = Database['public']['Tables']['focus_group_feedback']['Row'];
type UploadRow = Database['public']['Tables']['focus_group_uploads']['Row'];

export default function ParticipantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [uploads, setUploads] = useState<UploadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const { data: adminProfile } = await supabase
          .from('profiles')
          .select('is_admin')
          // @ts-ignore
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (!adminProfile || !adminProfile.is_admin) {
          router.push('/focus-group/feedback');
          return;
        }

        // Load participant profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          // @ts-ignore
          .eq('user_id', userId)
          .maybeSingle();

        if (profileError || !profileData) {
          setError('Participant not found');
          setLoading(false);
          return;
        }

        setProfile(profileData as ProfileRow);

        // Load feedback for this participant
        const { data: feedbackData } = await supabase
          .from('focus_group_feedback')
          .select('*')
          .eq('profile_id', profileData.id)
          .order('week_number', { ascending: true });

        setFeedback((feedbackData || []) as FeedbackRow[]);

        // Load uploads for this participant
        const { data: uploadsData } = await supabase
          .from('focus_group_uploads')
          .select('*')
          .eq('profile_id', profileData.id)
          .order('week_number', { ascending: true });

        setUploads((uploadsData || []) as UploadRow[]);

        setLoading(false);
      } catch (err) {
        console.error('Error loading participant data:', err);
        setError('Failed to load participant data');
        setLoading(false);
      }
    };

    if (userId) {
      loadData();
    }
  }, [userId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading participant data...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Participant not found'}</p>
          <Button onClick={() => router.push('/focus-group/admin')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 md:px-6">
      <div className="mb-6">
        <Link
          href="/focus-group/admin"
          className="text-[#C9A66B] hover:text-[#E7C686] transition-colors mb-4 inline-block"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-semibold text-[#0E2A22] mb-2">
          Participant Profile
        </h1>
        <p className="text-gray-600">
          User ID: <span className="font-mono text-xs">{userId}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">
              {(profile.status as string) || 'onboard_pending'}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Current Week: {profile.current_week || 'N/A'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#0E2A22]">{feedback.length}</p>
            <p className="text-sm text-gray-600 mt-2">Total entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#0E2A22]">{uploads.length}</p>
            <p className="text-sm text-gray-600 mt-2">Total images</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Summary profile={profile} />
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Feedback History</CardTitle>
          </CardHeader>
          <CardContent>
            {feedback.length === 0 ? (
              <p className="text-gray-500">No feedback entries yet.</p>
            ) : (
              <div className="space-y-4">
                {feedback.map((f) => (
                  <div key={f.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-[#0E2A22]">Week {f.week_number}</h3>
                      <span className="text-sm text-gray-500">
                        {f.created_at
                          ? new Date(f.created_at).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                    {f.overall_rating && (
                      <p className="text-sm text-gray-600 mb-2">
                        Overall Rating: {f.overall_rating}/10
                      </p>
                    )}
                    {f.product_usage && (
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-700">Product Usage:</p>
                        <p className="text-sm text-gray-600">{f.product_usage}</p>
                      </div>
                    )}
                    {f.perceived_changes && (
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-700">Perceived Changes:</p>
                        <p className="text-sm text-gray-600">{f.perceived_changes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Link href={`/focus-group/messages?userId=${userId}`}>
          <Button className="bg-[#C9A66B] hover:bg-[#E7C686] text-white">
            Send Message
          </Button>
        </Link>
        <Link href="/focus-group/admin/uploads">
          <Button variant="outline">View Uploads</Button>
        </Link>
      </div>
    </div>
  );
}

