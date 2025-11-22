'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { focusGroupFeedbackSchema, type FocusGroupFeedbackData } from '@/lib/validation/schemas';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Slider } from '@/components/ui/Slider';

interface FeedbackFormProps {
  initialValues?: Partial<FocusGroupFeedbackData>;
  onSubmit: (data: FocusGroupFeedbackData) => Promise<void> | void;
  isLoading?: boolean;
  week: number;
}

export default function FeedbackForm({
  initialValues,
  onSubmit,
  isLoading = false,
  week,
}: FeedbackFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FocusGroupFeedbackData>({
    resolver: zodResolver(focusGroupFeedbackSchema),
    defaultValues: {
      week_number: week,
      ...initialValues,
    },
  });

  const overallRating = watch('overall_rating');

  // Update week_number when week prop changes
  useEffect(() => {
    setValue('week_number', week);
  }, [week, setValue]);

  const handleFormSubmit = async (data: FocusGroupFeedbackData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Week Number (hidden, set automatically) */}
            <input type="hidden" {...register('week_number', { valueAsNumber: true })} />

            {/* Product Usage */}
            <div>
              <label
                htmlFor="product_usage"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Product Usage
              </label>
              <textarea
                id="product_usage"
                {...register('product_usage')}
                rows={4}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
                placeholder="How have you been using the product this week?"
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
                Perceived Changes
              </label>
              <textarea
                id="perceived_changes"
                {...register('perceived_changes')}
                rows={4}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
                placeholder="What changes have you noticed in your skin?"
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
                Concerns or Issues
              </label>
              <textarea
                id="concerns_or_issues"
                {...register('concerns_or_issues')}
                rows={4}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
                placeholder="Any concerns or issues you've experienced?"
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
                Emotional Response
              </label>
              <textarea
                id="emotional_response"
                {...register('emotional_response')}
                rows={4}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
                placeholder="How has using this product made you feel?"
              />
              {errors.emotional_response && (
                <p className="mt-1 text-sm text-red-600">{errors.emotional_response.message}</p>
              )}
            </div>

            {/* Overall Rating (1-10) */}
            <div>
              <label
                htmlFor="overall_rating"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Overall Rating: {overallRating || 'Not rated'} / 10
              </label>
              <Slider
                min={1}
                max={10}
                step={1}
                value={[overallRating || 5]}
                onValueChange={(value) => setValue('overall_rating', value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>10</span>
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
                Next Week Focus
              </label>
              <textarea
                id="next_week_focus"
                {...register('next_week_focus')}
                rows={3}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
                placeholder="What would you like to focus on or track next week?"
              />
              {errors.next_week_focus && (
                <p className="mt-1 text-sm text-red-600">{errors.next_week_focus.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#C9A66B] hover:bg-[#E7C686] text-white"
              >
                {isLoading ? 'Saving...' : 'Save Feedback'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}





