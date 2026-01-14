'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useFocusGroup } from '../context/FocusGroupContext';
import WeekSelector from '../components/WeekSelector';
import { useFeedback } from './hooks/useFeedback';
import FeedbackForm from './components/FeedbackForm';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ToastAlert } from '@/components/ui/Alert';
import type { FocusGroupFeedbackData } from '@/lib/validation/schemas';

export default function FeedbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentWeek } = useFocusGroup();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Determine week from query string or context - ensure it's never 0 or undefined
  const week = Number(searchParams.get('week')) || currentWeek || 1;

  // Use the simplified feedback hook
  const { feedback, loading, load, save, error } = useFeedback(week);

  // Load existing feedback for the week
  useEffect(() => {
    load();
  }, [load]);

  // Prepare initial values from existing feedback
  // IMPORTANT: If loading, OR if the feedback data doesn't match the current week (stale data), provide empty values
  // Using Number() cast to ensure safety against string/number mismatches
  const isDataForCurrentWeek = Number(feedback?.week_number) === week;
  const initialValues: Partial<FocusGroupFeedbackData> = (!loading && feedback && isDataForCurrentWeek)
    ? {
        week_number: feedback.week_number || week,
        product_usage: feedback.product_usage || undefined,
        perceived_changes: feedback.perceived_changes || undefined,
        concerns_or_issues: feedback.concerns_or_issues || undefined,
        emotional_response: feedback.emotional_response || undefined,
        overall_rating: feedback.overall_rating || undefined,
        next_week_focus: feedback.next_week_focus || undefined,
      }
    : {
        week_number: week,
      };

  // Handle form submission
  const handleSubmit = async (data: FocusGroupFeedbackData) => {
    try {
      await save(data);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    } catch (err) {
      console.error('Error saving feedback:', err);
      // Error is handled by the hook
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-primary font-bold text-[#0E2A22] mb-2">
          Week {week} Feedback
        </h1>
        <p className="text-gray-600">
          Share your weekly experience with the product. Your feedback helps us improve and
          understand how the elixir is working for you.
        </p>
      </div>

      {/* Week Selector */}
      <WeekSelector currentWeek={week} basePath="/focus-group/feedback" />

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mb-6">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <p className="text-green-800">Feedback saved successfully!</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6">
          <ToastAlert
            message={error}
            variant="error"
            onDismiss={() => {}}
          />
        </div>
      )}

      {/* Feedback Form */}
      {loading ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Loading feedback...</p>
          </CardContent>
        </Card>
      ) : (
        <FeedbackForm
          key={week} // Force re-mount when week changes to ensure fresh state
          initialValues={initialValues}
          onSubmit={handleSubmit}
          isLoading={false}
          week={week}
        />
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => router.push(`/focus-group/upload?week=${week}`)}
          variant="outline"
          className="flex-1"
        >
          Upload Week {week} Photos
        </Button>
        <Button
          onClick={() => router.push('/focus-group/profile/summary')}
          variant="outline"
          className="flex-1"
        >
          Back to Summary
        </Button>
      </div>
    </div>
  );
}
