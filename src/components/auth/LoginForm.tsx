'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/client';
import { loginSchema, type LoginData } from '@/lib/validation/schemas';
import { Button } from '@/components/ui/Button';
import { SimpleInput } from '@/components/ui/SimpleInput';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate form data
      const formData: LoginData = { email, password };
      loginSchema.parse(formData);

      // Sign in with Supabase
      const supabase = createClientSupabase();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Provide more helpful error messages
        let errorMessage = signInError.message || 'Failed to sign in. Please check your credentials.';
        
        if (signInError.message?.includes('Email not confirmed')) {
          errorMessage = 'Email not confirmed. Please check your email for a confirmation link, or disable email confirmation in Supabase settings for development.';
        } else if (signInError.message?.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials or create a new account.';
        }
        
        setError(errorMessage);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Check if user has a profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          // @ts-ignore - Supabase type inference limitation with user_id filter
          .eq('user_id', data.user.id)
          .single();

        // Redirect to profile setup if no profile exists
        if (!profile) {
          router.push('/focus-group/profile');
        } else {
          router.push('/focus-group/feedback');
        }
        router.refresh();
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errors' in err) {
        // Zod validation errors
        const zodError = err as { errors?: Array<{ message?: string }> };
        setError(zodError.errors?.[0]?.message || 'Please check your input.');
      } else {
        const message = err instanceof Error ? err.message : 'An error occurred. Please try again.';
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <SimpleInput
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <SimpleInput
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          disabled={loading}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}

