'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClientSupabase } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';
import type { ProfileData } from '@/lib/validation/schemas';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface UseProfileDataReturn {
  profile: ProfileRow | null;
  isLoading: boolean;
  saveProfile: (updates: Partial<ProfileData>) => Promise<{ success: boolean; wasFirstSave: boolean }>;
  autoSave: (updates: Partial<ProfileData>) => Promise<void>;
  isSaving: boolean;
  error: string | null;
}

export function useProfileData(): UseProfileDataReturn {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false); // Track saving state to prevent concurrent saves

  // Fetch existing profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const supabase = createClientSupabase();

        // Get session first to ensure it's loaded
        const { data: { session } } = await supabase.auth.getSession();
        
        let user = session?.user ?? undefined;
        
        // If no user from session, try getUser as fallback
        if (!user) {
          const { data: { user: userData } } = await supabase.auth.getUser();
          user = userData ?? undefined;
        }

        if (!user) {
          setIsLoading(false);
          return;
        }

        // Fetch profile
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching profile:', fetchError);
          setError(fetchError.message);
        } else {
          setProfile(data);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load profile';
        setError(message);
        console.error('Error in fetchProfile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Save profile function
  const saveProfile = useCallback(async (updates: Partial<ProfileData>): Promise<{ success: boolean; wasFirstSave: boolean }> => {
    // Prevent multiple simultaneous saves
    if (isSavingRef.current) {
      console.warn('Save already in progress, skipping duplicate save');
      return { success: false, wasFirstSave: false };
    }

    try {
      isSavingRef.current = true;
      setIsSaving(true);
      setError(null);
      const supabase = createClientSupabase();

      // Wait a bit for session to initialize if needed
      // Get session first to ensure it's loaded
      let session = null;
      let user = null;
      
      try {
        const sessionResult = await supabase.auth.getSession();
        session = sessionResult.data.session;
        user = session?.user;
      } catch (sessionError) {
        console.warn('Session error (non-fatal):', sessionError);
      }
      
      // If no user from session, try getUser as fallback
      if (!user) {
        try {
          const userResult = await supabase.auth.getUser();
          if (userResult.error) {
            // If getUser also fails, check if we're in a browser and session might be loading
            if (typeof window !== 'undefined') {
              // Wait a moment and try session again
              await new Promise(resolve => setTimeout(resolve, 100));
              const retrySession = await supabase.auth.getSession();
              if (retrySession.data.session?.user) {
                user = retrySession.data.session.user;
              } else {
                throw new Error('User not authenticated. Please sign in again.');
              }
            } else {
              throw new Error('User not authenticated. Please sign in again.');
            }
          } else {
            user = userResult.data.user;
          }
        } catch (userError: unknown) {
          const errorMessage = userError instanceof Error ? userError.message : 'Unknown error';
          console.error('User error:', userError);
          throw new Error('Failed to get user: ' + errorMessage);
        }
      }
      
      if (!user) {
        throw new Error('User not authenticated. Please sign in again.');
      }

      // Check if profile exists and get current data
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const isFirstSave = !existingProfile;

      // Check if all required fields are present
      // Required: age_range, fitzpatrick_skin_tone, top_concerns (at least 1), image_consent (true)
      const mergedData = { ...existingProfile, ...updates } as Partial<ProfileData>;
      const hasAllRequiredFields =
        mergedData.age_range &&
        mergedData.fitzpatrick_skin_tone &&
        mergedData.top_concerns &&
        Array.isArray(mergedData.top_concerns) &&
        mergedData.top_concerns.length > 0 &&
        mergedData.image_consent === true;

      // Determine status based on required fields
      const newStatus = hasAllRequiredFields ? 'profile_complete' : 'onboard_pending';
      const newCurrentWeek = hasAllRequiredFields && !existingProfile?.current_week ? 1 : existingProfile?.current_week;

      if (!existingProfile) {
        // First save - create profile
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            ...updates,
            status: newStatus,
            current_week: newCurrentWeek || null,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        setProfile(newProfile);
      } else {
        // Update existing profile - update status if all required fields are now present
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({
            ...updates,
            status: newStatus,
            current_week: newCurrentWeek || existingProfile.current_week || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingProfile.id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        setProfile(updatedProfile);
      }

      return {
        success: true,
        wasFirstSave: isFirstSave,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save profile';
      setError(message);
      console.error('Error saving profile:', err);
      throw err;
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }, []);

  // Auto-save with debounce (2 seconds)
  const autoSave = useCallback(
    (updates: Partial<ProfileData>): Promise<void> => {
      return new Promise((resolve, reject) => {
        // Don't auto-save if already saving
        if (isSavingRef.current) {
          resolve(); // Resolve silently to prevent error spam
          return;
        }

        // Clear existing timeout
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }

        // Set new timeout
        autoSaveTimeoutRef.current = setTimeout(() => {
          // Check again before saving
          if (isSavingRef.current) {
            resolve();
            return;
          }

          saveProfile(updates)
            .then(() => {
              resolve();
            })
            .catch((err) => {
              // Check if it's an auth error - reject to stop auto-save
              const errorMessage = err instanceof Error ? err.message : String(err);
              if (errorMessage.includes('not authenticated') || errorMessage.includes('Auth session')) {
                // Reject auth errors to stop auto-save attempts
                reject(err);
              } else {
                // Other errors - log but don't stop auto-save
                console.error('Auto-save failed:', err);
                reject(err);
              }
            });
        }, 2000); // 2 second debounce
      });
    },
    [saveProfile]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    profile,
    isLoading,
    saveProfile,
    autoSave,
    isSaving,
    error,
  };
}

