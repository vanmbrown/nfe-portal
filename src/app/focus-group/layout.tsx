'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClientSupabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import SkipLinkHandler from '@/components/shared/SkipLinkHandler';

export default function FocusGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClientSupabase();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // Protect routes (except login)
      if (!session && pathname !== '/focus-group/login') {
        router.push('/focus-group/login');
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      // Protect routes (except login)
      if (!session && pathname !== '/focus-group/login') {
        router.push('/focus-group/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

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
            href={user ? "/focus-group/feedback" : "/focus-group/login"} 
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

