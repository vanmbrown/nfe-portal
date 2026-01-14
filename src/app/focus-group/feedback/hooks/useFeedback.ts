'use client';

import { useState, useCallback } from 'react';
import { createClientSupabase } from '@/lib/supabase/client';

export function useFeedback(week: number) {
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFeedback(null); // Clear previous feedback immediately
    setError(null);
    
    try {
      // Get session token to include in request
      const supabase = createClientSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: HeadersInit = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const res = await fetch(`/api/focus-group/feedback/get?week=${week}`, {
        headers,
        credentials: 'include', // Include cookies
        cache: 'no-store', // Disable caching to ensure fresh data
      });
      const json = await res.json();
      console.log(`[useFeedback] Load week ${week} response:`, json);

      if (res.ok) {
        setFeedback(json.feedback);
      } else {
        console.error("Error loading feedback:", json.error);
        setError(json.error || "Failed to load feedback");
      }
    } catch (err) {
      console.error("Error loading feedback:", err);
      setError("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  }, [week]);

  const save = useCallback(async (data: any) => {
    setLoading(true);
    setError(null);
    
    try {
      // Get session token to include in request
      const supabase = createClientSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      console.log(`[Feedback] Saving week ${week}:`, data);

      const res = await fetch(`/api/focus-group/feedback/post`, {
        method: "POST",
        headers,
        credentials: 'include', // Include cookies
        body: JSON.stringify({ week_number: week, ...data }),
      });

      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || "Failed to save feedback");
      }
      
      // Update local state immediately with the saved data
      setFeedback((prev: any) => ({
        ...prev,
        ...data,
        week_number: week,
      }));

      return json;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save feedback";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [week]);

  return { feedback, loading, load, save, error };
}
