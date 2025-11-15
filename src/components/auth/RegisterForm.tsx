'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/client';
import { registerSchema, type RegisterData } from '@/lib/validation/schemas';
import { Button } from '@/components/ui/Button';
import { SimpleInput } from '@/components/ui/SimpleInput';

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate form data
      const formData: RegisterData = { email, password, confirmPassword };
      registerSchema.parse(formData);

      // Sign up with Supabase
      const supabase = createClientSupabase();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message || 'Failed to create account. Please try again.');
        setLoading(false);
        return;
      }

      if (data.user) {
        // Redirect to profile setup
        router.push('/focus-group/profile');
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
          placeholder="Create a password"
          required
          disabled={loading}
        />
        <p className="mt-1 text-xs text-gray-500">
          Must contain uppercase, lowercase, and a number
        </p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <SimpleInput
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
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
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
}








