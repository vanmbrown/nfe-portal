'use client';

import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import type { Database } from '@/types/supabase';
import { createClientSupabase } from '@/lib/supabase/client';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export type ProfileStatus = 'onboard_pending' | 'profile_complete' | 'week_active' | 'study_complete';

export interface FocusGroupProfile {
  id: string;
  user_id: string;
  status: ProfileStatus | null;
  current_week: number | null;
  [key: string]: unknown; // Allow other profile fields
}

export interface FocusGroupContextValue {
  profile: FocusGroupProfile | null;
  status: ProfileStatus | null;
  currentWeek: number | null;
  isStudyComplete: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

const FocusGroupContext = createContext<FocusGroupContextValue | undefined>(undefined);

export function FocusGroupProvider({
  children,
  profile: initialProfile,
  isAdmin = false,
}: {
  children: ReactNode;
  profile: ProfileRow | null;
  isAdmin?: boolean;
}) {
  const [profile, setProfile] = useState<ProfileRow | null>(initialProfile);
  // If no initial profile, we'll try to fetch it, so start loading
  const [isProfileLoading, setIsProfileLoading] = useState(!initialProfile);
  
  const refreshProfile = useCallback(async () => {
    setIsProfileLoading(true);
    try {
      const supabase = createClientSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (!error && data) {
          setProfile(data);
        }
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    } finally {
      setIsProfileLoading(false);
    }
  }, []);
  
  // Update profile when initialProfile changes, or fetch if missing
  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
      setIsProfileLoading(false);
    } else {
      // If no profile from server, try fetching client-side
      refreshProfile();
    }
  }, [initialProfile, refreshProfile]);
  
  const status = (profile?.status as ProfileStatus) || null;
  const currentWeek = profile?.current_week ?? null;
  const isStudyComplete = status === 'study_complete';

  const value: FocusGroupContextValue = {
    profile: profile as FocusGroupProfile | null,
    status,
    currentWeek,
    isStudyComplete,
    isLoading: isProfileLoading,
    isAdmin,
    refreshProfile,
  };

  return (
    <FocusGroupContext.Provider value={value}>
      {children}
    </FocusGroupContext.Provider>
  );
}

export function useFocusGroup(): FocusGroupContextValue {
  const context = useContext(FocusGroupContext);
  if (context === undefined) {
    throw new Error('useFocusGroup must be used within a FocusGroupProvider');
  }
  return context;
}
