'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClientSupabase } from '@/lib/supabase/client';
import {
  focusGroupFeedbackSchema,
  type FocusGroupFeedbackData,
} from '@/lib/validation/schemas';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Slider } from '@/components/ui/Slider';
import { calculateWeekNumber, getWeekNumberOptions } from '@/lib/focus-group/week-calculation';
import type { Profile } from '@/types/focus-group';

interface FeedbackFormProps {
  onSuccess?: () => void;
}

export default function FeedbackForm({ onSuccess }: FeedbackFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [calculatedWeek, setCalculatedWeek] = useState<number | null>(null);
  const [useManualWeek, setUseManualWeek] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FocusGroupFeedbackData>({
    resolver: zodResolver(focusGroupFeedbackSchema),
    defaultValues: {
      week_number: 1,
    },
  });

  const overallRating = watch('overall_rating');
  const weekNumber = watch('week_number');

  // Load profile and calculate week
  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClientSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        // @ts-ignore - Supabase type inference limitation with user_id filter
        .eq('user_id', user.id)
        .single();

      if (profileData && typeof profileData === 'object' && 'id' in profileData) {
        const profile = profileData as Profile;
        setProfile(profile);
        if (profile.created_at) {
          const week = calculateWeekNumber(profile.created_at);
          setCalculatedWeek(week);
          if (!useManualWeek) {
            setValue('week_number', week);
          }
        }
      }
    };

    loadProfile();
  }, [setValue, useManualWeek]);

  const onSubmit = async (data: FocusGroupFeedbackData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Get session token for authenticated request
      const supabase = createClientSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/focus-group/feedback', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit feedback');
      }

      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      }

      // Reset form after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        window.location.reload();
      }, 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit feedback. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const weekOptions = getWeekNumberOptions();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
          Feedback submitted successfully!
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Week Number */}
            <div>
              <label htmlFor="week_number" className="block text-sm font-medium text-gray-700 mb-2">
                Week Number <span className="text-red-500">*</span>
              </label>
              {calculatedWeek !== null && !useManualWeek ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      id="week_number"
                      value={calculatedWeek}
                      readOnly
                      className="w-32 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
                    />
                    <span className="text-sm text-gray-500">
                      (Auto-calculated from profile creation date)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseManualWeek(true)}
                    className="text-sm text-[#C9A66B] hover:underline"
                  >
                    Manually select week
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    id="week_number"
                    {...register('week_number', { valueAsNumber: true })}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
                  >
                    {weekOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {calculatedWeek !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        setUseManualWeek(false);
                        setValue('week_number', calculatedWeek);
                      }}
                      className="text-sm text-[#C9A66B] hover:underline"
                    >
                      Use auto-calculated week ({calculatedWeek})
                    </button>
                  )}
                </div>
              )}
              {errors.week_number && (
                <p className="mt-1 text-sm text-red-600">{errors.week_number.message}</p>
              )}
            </div>

            {/* Product Usage */}
            <div>
              <label
                htmlFor="product_usage"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Product Usage (Optional)
              </label>
              <textarea
                id="product_usage"
                {...register('product_usage')}
                rows={3}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
                placeholder="e.g., Used twice daily, morning and night"
              />
              {errors.product_usage && (
                <p className="mt-1 text-sm text-red-600">{errors.product_usage.message}</p>
              )}
            </div>

            {/* Perceived Changes */}
            <div>
              <label
                htmlFor="perceived_changes"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Perceived Changes (Optional)
              </label>
              <textarea
                id="perceived_changes"
                {...register('perceived_changes')}
                rows={4}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
                placeholder="Describe any visible or felt changes in your skin..."
              />
              {errors.perceived_changes && (
                <p className="mt-1 text-sm text-red-600">{errors.perceived_changes.message}</p>
              )}
            </div>

            {/* Concerns or Issues */}
            <div>
              <label
                htmlFor="concerns_or_issues"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Concerns or Issues (Optional)
              </label>
              <textarea
                id="concerns_or_issues"
                {...register('concerns_or_issues')}
                rows={3}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
                placeholder="Any irritation, sensitivity, or concerns?"
              />
              {errors.concerns_or_issues && (
                <p className="mt-1 text-sm text-red-600">{errors.concerns_or_issues.message}</p>
              )}
            </div>

            {/* Emotional Response */}
            <div>
              <label
                htmlFor="emotional_response"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Emotional Response (Optional)
              </label>
              <textarea
                id="emotional_response"
                {...register('emotional_response')}
                rows={3}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
                placeholder="How are you feeling about your skin? (confident, calm, uncertain, etc.)"
              />
              {errors.emotional_response && (
                <p className="mt-1 text-sm text-red-600">{errors.emotional_response.message}</p>
              )}
            </div>

            {/* Overall Rating */}
            <div>
              <label htmlFor="overall-rating-slider" className="block text-sm font-medium text-gray-700 mb-2">
                Overall Satisfaction Rating (Optional)
              </label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">1</span>
                  <span className="text-sm font-medium text-gray-900">
                    {overallRating || 'Not rated'}
                  </span>
                  <span className="text-sm text-gray-600">10</span>
                </div>
                <Slider
                  value={[overallRating || 5]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => setValue('overall_rating', value[0])}
                  aria-label="Overall satisfaction rating"
                />
                <input
                  type="hidden"
                  {...register('overall_rating', { valueAsNumber: true })}
                />
              </div>
              {errors.overall_rating && (
                <p className="mt-1 text-sm text-red-600">{errors.overall_rating.message}</p>
              )}
            </div>

            {/* Next Week Focus */}
            <div>
              <label
                htmlFor="next_week_focus"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Next Week Focus (Optional)
              </label>
              <textarea
                id="next_week_focus"
                {...register('next_week_focus')}
                rows={3}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
                placeholder="What will you focus on next week?"
              />
              {errors.next_week_focus && (
                <p className="mt-1 text-sm text-red-600">{errors.next_week_focus.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" variant="primary" disabled={loading} className="flex-1">
          {loading ? 'Submitting...' : 'Submit Weekly Feedback'}
        </Button>
      </div>
    </form>
  );
}

