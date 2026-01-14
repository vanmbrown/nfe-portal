'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClientSupabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import SkipLinkHandler from '@/components/shared/SkipLinkHandler';
import { useFocusGroup } from '../context/FocusGroupContext';
import { useNotifications } from '../hooks/useNotifications';

interface FocusGroupClientLayoutProps {
  children: React.ReactNode;
}

export default function FocusGroupClientLayout({
  children,
}: FocusGroupClientLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile, isLoading: profileLoading, isAdmin } = useFocusGroup();
  const { unreadAdminMessagesCount } = useNotifications();

  useEffect(() => {
    const supabase = createClientSupabase();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // Protect routes (except login)
      if (!session && pathname !== '/focus-group/login') {
        console.log('[Client Layout] No session found in initial check, redirecting to login');
        router.push('/focus-group/login');
        return;
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      // Protect routes (except login)
      if (!session && pathname !== '/focus-group/login') {
        console.log('[Client Layout] Session lost (auth change), redirecting to login');
        router.push('/focus-group/login');
        return;
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);
  
  // Navigation guard - TEMPORARILY DISABLED FOR DEBUGGING
  useEffect(() => {
    if (loading || !user || profileLoading) return;

    // Skip all redirects for admin pages
    if (pathname?.startsWith('/focus-group/admin')) return;
    // Skip redirects for debug page
    if (pathname?.startsWith('/focus-group/debug')) return;

    // TEMPORARILY COMMENTED OUT TO ISOLATE REDIRECT ISSUE
    // // If no profile → force profile page
    // if (!profile && pathname !== '/focus-group/profile' && pathname !== '/focus-group/login') {
    //   router.replace('/focus-group/profile');
    //   return;
    // }

    // // If profile complete (or in active week/study complete) → redirect root and profile form to feedback
    // if (profile?.status === 'profile_complete' || profile?.status === 'week_active' || profile?.status === 'study_complete') {
    //   // Redirect from root or profile form page to feedback
    //   if (pathname === '/focus-group' || pathname === '/focus-group/' || pathname === '/focus-group/profile') {
    //     router.replace('/focus-group/feedback');
    //     return;
    //   }
    //   // Allow navigation to other pages (feedback, upload, messages, etc.)
    //   // Don't return early - let navigation proceed normally
    // }

  }, [loading, user, profile, pathname, router, profileLoading]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow login page without auth
  if (pathname === '/focus-group/login') {
    return <>{children}</>;
  }

  // Require auth for all other pages
  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-[#F6F5F3]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-[#C9A66B] focus:text-[#0E2A22]"
      >
        Skip to content
      </a>
      <nav className="bg-[#0E2A22] text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link
            href="/focus-group"
            className="text-xl font-primary font-bold hover:text-[#E7C686] transition-colors cursor-pointer"
          >
            NFE Portal
          </Link>
          <div className="flex gap-4 items-center">
            {user && (
              <>
                <Link
                  href="/focus-group/profile"
                  className="hover:text-[#E7C686] transition-colors"
                >
                  Profile
                </Link>
                <Link
                  href="/focus-group/feedback"
                  className="hover:text-[#E7C686] transition-colors"
                >
                  Feedback
                </Link>
                <Link
                  href="/focus-group/upload"
                  className="hover:text-[#E7C686] transition-colors"
                >
                  Upload
                </Link>
                <Link
                  href="/focus-group/messages"
                  className="hover:text-[#E7C686] transition-colors relative"
                >
                  Messages
                  {unreadAdminMessagesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#E7C686] text-[#0E2A22] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadAdminMessagesCount}
                    </span>
                  )}
                </Link>
                {isAdmin && (
                  <Link
                    href="/focus-group/admin"
                    className="hover:text-[#E7C686] transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={async () => {
                    const supabase = createClientSupabase();
                    await supabase.auth.signOut();
                        router.push('/focus-group/login');
                  }}
                  className="hover:text-[#E7C686] transition-colors"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <SkipLinkHandler />
    </div>
  );
}

