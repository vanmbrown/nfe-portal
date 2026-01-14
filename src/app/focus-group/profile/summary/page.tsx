'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientSupabase } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';
import { useFocusGroup } from '../../context/FocusGroupContext';
import Summary from '../Summary';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export default function ProfileSummaryPage() {
  const router = useRouter();
  const { profile: contextProfile, status, currentWeek, isStudyComplete, isLoading } = useFocusGroup();
  const [profile, setProfile] = useState<ProfileRow | null>(contextProfile as ProfileRow | null);
  const [loading, setLoading] = useState(false);

  // Fetch profile if not in context - only fetch once
  useEffect(() => {
    // If we already have profile, use it
    if (contextProfile) {
      setProfile(contextProfile as ProfileRow);
      return;
    }

    // If context is still loading, wait
    if (isLoading) {
      return;
    }

    // If no profile in context and not loading, fetch it
    if (!profile && !loading) {
      setLoading(true);
      const fetchProfile = async () => {
        try {
          const supabase = createClientSupabase();
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', user.id)
              .maybeSingle();
            
            if (error) {
              console.error('Error fetching profile:', error);
            } else if (data) {
              setProfile(data);
            }
          }
        } catch (err) {
          console.error('Error in fetchProfile:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    }
  }, [contextProfile, isLoading, profile, loading]);

  // Redirect if no profile after loading
  useEffect(() => {
    if (!isLoading && !loading && !profile) {
      router.push('/focus-group/profile');
    }
  }, [profile, isLoading, loading, router]);

  // Show loading state
  if (isLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600">Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600">No profile found. Redirecting to profile form...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Completion banner if study is complete */}
      {isStudyComplete && (
        <Card className="mb-6 border-[#C9A66B] bg-[#F6F5F3]">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-[#0E2A22] mb-2">Study Complete</h2>
            <p className="text-gray-700">
              Thank you for participating in our focus group study! Your feedback has been invaluable.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-primary font-bold text-[#0E2A22] mb-2">
          Profile Summary
        </h1>
        <p className="text-gray-600">
          Review your profile information and continue with your weekly check-ins.
        </p>
      </div>

      {/* Profile Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Summary profile={profile} />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => router.push('/focus-group/profile')}
          variant="outline"
          className="flex-1"
        >
          Edit Profile
        </Button>

        {!isStudyComplete && currentWeek && (
          <Button
            onClick={() => router.push(`/focus-group/feedback?week=${currentWeek}`)}
            className="flex-1 bg-[#C9A66B] hover:bg-[#E7C686] text-white"
          >
            Start Week {currentWeek} Check In
          </Button>
        )}
      </div>
    </div>
  );
}
