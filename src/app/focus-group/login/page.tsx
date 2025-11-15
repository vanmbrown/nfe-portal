'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/client';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [checkingSession, setCheckingSession] = useState(true);
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    // Check for error parameters in URL (from auth callback)
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const message = params.get('message');
    
    if (error && message) {
      setUrlError(decodeURIComponent(message));
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Check if user is already logged in
    const checkSession = async () => {
      const supabase = createClientSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // Check if user has profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          // @ts-ignore - Supabase type inference limitation with user_id filter
          .eq('user_id', session.user.id)
          .single();

        if (!profile) {
          router.push('/focus-group/profile');
        } else {
          router.push('/focus-group/feedback');
        }
      } else {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [router]);

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F5F3]">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F5F3] py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-primary text-center">
            {isLogin ? 'Sign In' : 'Create Account'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {urlError && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
              <p className="font-semibold mb-1">Email Link Expired</p>
              <p>{urlError}</p>
              <p className="mt-2 text-xs">
                Please register a new account or contact support if you need assistance.
              </p>
            </div>
          )}
          {isLogin ? <LoginForm /> : <RegisterForm />}

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#C9A66B] hover:text-[#B8955A] underline text-sm"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

