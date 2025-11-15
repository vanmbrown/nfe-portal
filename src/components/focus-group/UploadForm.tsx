'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClientSupabase } from '@/lib/supabase/client';
import {
  focusGroupUploadSchema,
  type FocusGroupUploadData,
} from '@/lib/validation/schemas';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { FileUpload } from '@/components/ui/FileUpload';
import { calculateWeekNumber } from '@/lib/focus-group/week-calculation';
import type { Profile } from '@/types/focus-group';

interface UploadFormProps {
  onSuccess?: () => void;
}

export default function UploadForm({ onSuccess }: UploadFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [calculatedWeek, setCalculatedWeek] = useState<number | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FocusGroupUploadData>({
    resolver: zodResolver(focusGroupUploadSchema),
    defaultValues: {
      week_number: 1,
      consent_given: false,
    },
  });

  const consentGiven = watch('consent_given');
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
          setValue('week_number', week);
        }
      }
    };

    loadProfile();
  }, [setValue]);

  const onSubmit = async (data: FocusGroupUploadData) => {
    if (files.length === 0) {
      setError('Please select at least one image to upload');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Get session token for authenticated request
      const supabase = createClientSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: HeadersInit = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('notes', data.notes || '');
      formData.append('consent_given', data.consent_given.toString());
      formData.append('week_number', weekNumber.toString());

      const response = await fetch('/api/focus-group/uploads', {
        method: 'POST',
        headers,
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload images');
      }

      setSuccess(true);
      setFiles([]);
      if (onSuccess) {
        onSuccess();
      }

      // Reset form after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        window.location.reload();
      }, 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to upload images. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
          Images uploaded successfully!
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Week Number Display */}
            {calculatedWeek !== null && (
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-2">
                  Week Number
                </div>
                <div className="text-sm text-gray-600">
                  Week {calculatedWeek} (Auto-calculated from profile creation date)
                </div>
                <input
                  type="hidden"
                  {...register('week_number', { valueAsNumber: true })}
                />
              </div>
            )}

            {/* File Upload */}
            <div>
              <div className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images <span className="text-red-500">*</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Upload 1-3 images showing your progress (front, left, right views recommended)
              </p>
              <FileUpload
                maxFiles={3}
                maxSizeMB={5}
                accept="image/*"
                onFilesChange={setFiles}
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                {...register('notes')}
                rows={3}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
                placeholder="Any additional notes or comments about these images..."
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
              )}
            </div>

            {/* Consent */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="consent_given"
                {...register('consent_given')}
                className="mt-1 w-4 h-4 text-[#C9A66B] border-gray-300 rounded focus:ring-[#C9A66B]"
              />
              <label htmlFor="consent_given" className="text-sm text-gray-700">
                <span className="font-medium">Image Consent</span>{' '}
                <span className="text-red-500">*</span>
                <p className="text-xs text-gray-500 mt-1">
                  I consent to NFE using these images for research and product development
                  purposes. Images will be stored securely and used only for the stated purposes.
                </p>
              </label>
            </div>
            {errors.consent_given && (
              <p className="text-sm text-red-600 ml-7">{errors.consent_given.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" variant="primary" disabled={loading || files.length === 0} className="flex-1">
          {loading ? 'Uploading...' : 'Upload Images'}
        </Button>
      </div>
    </form>
  );
}

