'use client';

import React, { useState, useEffect } from 'react';
import { createClientSupabase } from '@/lib/supabase/client';
import FeedbackForm from '@/components/focus-group/FeedbackForm';
import { Card, CardContent } from '@/components/ui/Card';
import Link from 'next/link';
import type { FocusGroupFeedback } from '@/types/focus-group';

export default function FeedbackPage() {
  const [feedbackHistory, setFeedbackHistory] = useState<FocusGroupFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeedback = async () => {
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
          headers,
        });
        const result = await response.json();

        if (response.ok && result.data) {
          // Map database 'week' field to 'week_number' for component compatibility
          type FeedbackRow = { week: number; [key: string]: unknown };
          setFeedbackHistory(
            (result.data as FeedbackRow[]).map((f) => ({
              ...f,
              week_number: f.week,
            })) as unknown as FocusGroupFeedback[]
          );
        }
      } catch (error) {
        console.error('Failed to load feedback history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeedback();
  }, []);

  const handleSuccess = () => {
    // Reload feedback history after successful submission
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-primary font-bold text-[#0E2A22] mb-2">
          Weekly Feedback
        </h1>
        <p className="text-gray-600">
          Share your weekly experience with the product. Your feedback helps us improve and
          understand how the elixir is working for you.
        </p>
      </div>

      <FeedbackForm onSuccess={handleSuccess} />

      {/* Feedback History */}
      {feedbackHistory.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Feedback History</h2>
          <div className="space-y-4">
            {feedbackHistory.map((feedback) => (
              <Card key={feedback.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Week {feedback.week_number}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {feedback.created_at
                        ? new Date(feedback.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Date not available'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {feedback.product_usage && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Product Usage:</p>
                        <p className="text-sm text-gray-600">{feedback.product_usage}</p>
                      </div>
                    )}
                    {feedback.perceived_changes && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Perceived Changes:</p>
                        <p className="text-sm text-gray-600">{feedback.perceived_changes}</p>
                      </div>
                    )}
                    {feedback.concerns_or_issues && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Concerns:</p>
                        <p className="text-sm text-gray-600">{feedback.concerns_or_issues}</p>
                      </div>
                    )}
                    {feedback.emotional_response && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Emotional Response:</p>
                        <p className="text-sm text-gray-600">{feedback.emotional_response}</p>
                      </div>
                    )}
                    {feedback.overall_rating && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Overall Rating:</p>
                        <p className="text-sm text-gray-600">{feedback.overall_rating}/10</p>
                      </div>
                    )}
                    {feedback.next_week_focus && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Next Week Focus:</p>
                        <p className="text-sm text-gray-600">{feedback.next_week_focus}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Link */}
      <div className="mt-8 text-center">
        <Link
          href="/focus-group/upload"
          className="text-[#C9A66B] hover:text-[#E7C686] transition-colors text-sm underline"
        >
          Upload progress images →
        </Link>
      </div>
    </div>
  );
}
