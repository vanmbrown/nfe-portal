'use client';

import React, { useEffect, useState } from 'react';
import { createClientSupabase } from '@/lib/supabase/client';
import { useFocusGroup } from '../context/FocusGroupContext';

function RawProfileCheck() {
  const [rawProfile, setRawProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    async function check() {
      try {
        const supabase = createClientSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (error) throw error;
          setRawProfile(data);
        } else {
          setError('No user logged in');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    check();
  }, []);

  if (loading) return <p>Loading raw profile...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!rawProfile) return <p>No profile data found</p>;
  
  return (
    <pre className="text-xs overflow-auto bg-gray-50 p-2 rounded border">
      {JSON.stringify({ 
        id: rawProfile.id,
        is_admin: rawProfile.is_admin,
        is_admin_type: typeof rawProfile.is_admin,
        status: rawProfile.status,
        email: rawProfile.email,
        user_id: rawProfile.user_id
      }, null, 2)}
    </pre>
  );
}

export default function DebugPage() {
  const { profile, isAdmin, isLoading } = useFocusGroup();
  const [feedbackData, setFeedbackData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function fetchRawData() {
      try {
        const supabase = createClientSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError('No user logged in');
          setLoading(false);
          return;
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!profileData) {
          setError('No profile found for user');
          setLoading(false);
          return;
        }

        const { data: feedback, error: dbError } = await supabase
          .from('focus_group_feedback')
          .select('*')
          .eq('profile_id', profileData.id);

        if (dbError) {
          setError(dbError.message);
        } else {
          setFeedbackData(feedback || []);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRawData();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Dashboard</h1>
      
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="font-bold mb-2">Context State (from Server Layout)</h2>
        <p className="text-sm mb-2">Is Loading: {String(isLoading)}</p>
        <pre className="text-xs overflow-auto bg-white p-2 border">
          {JSON.stringify({ 
            isAdmin, 
            profileId: profile?.id, 
            profileIsAdmin: profile?.is_admin,
            status: profile?.status,
            currentWeek: profile?.current_week
          }, null, 2)}
        </pre>
      </div>

      <div className="mb-8 p-4 bg-blue-50 rounded">
        <h2 className="font-bold mb-2">Raw Database Profile Check (Direct Query)</h2>
        <RawProfileCheck />
      </div>

      <div className="mb-8">
        <h2 className="font-bold mb-2">Raw Database Feedback ({feedbackData.length} rows)</h2>
        {loading && <p>Loading DB...</p>}
        {error && <p className="text-red-500">{error}</p>}
        
        {!loading && !error && (
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Week</th>
                <th className="border p-2">Product Usage</th>
                <th className="border p-2">Created At</th>
              </tr>
            </thead>
            <tbody>
              {feedbackData.map((row) => (
                <tr key={row.id}>
                  <td className="border p-2 text-center">{row.week_number}</td>
                  <td className="border p-2">{row.product_usage?.substring(0, 50)}...</td>
                  <td className="border p-2">{new Date(row.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {feedbackData.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-500">No records found in DB</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
