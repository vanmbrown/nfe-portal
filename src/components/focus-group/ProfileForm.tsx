'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClientSupabase } from '@/lib/supabase/client';
import { profileSchema, type ProfileData } from '@/lib/validation/schemas';
import { useProfileData } from '@/app/focus-group/profile/hooks/useProfileData';
import { useFocusGroup } from '@/app/focus-group/context/FocusGroupContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { AgeRange, FitzpatrickSkinTone, SkinConcern, LifestyleFactor } from '@/types/focus-group';
import { cn } from '@/lib/utils';

const AGE_RANGES: AgeRange[] = ['18-25', '26-35', '36-45', '46-55', '56+'];

const FITZPATRICK_SCALE = [
  { value: 1, description: 'Type I - Always burns, never tans (pale white skin)' },
  { value: 2, description: 'Type II - Burns easily, tans minimally (fair skin)' },
  { value: 3, description: 'Type III - Sometimes burns, gradually tans (light brown skin)' },
  { value: 4, description: 'Type IV - Burns minimally, tans easily (moderate brown skin)' },
  { value: 5, description: 'Type V - Rarely burns, tans very easily (dark brown skin)' },
  { value: 6, description: 'Type VI - Never burns, deeply pigmented (very dark brown to black skin)' },
] as const;

const SKIN_TYPES = ['Dry', 'Oily', 'Combination', 'Normal', 'Sensitive'] as const;

const SKIN_CONCERNS: { value: SkinConcern; label: string }[] = [
  { value: 'dark_spots', label: 'Dark Spots' },
  { value: 'dryness_barrier', label: 'Dryness/Barrier Issues' },
  { value: 'fine_lines', label: 'Fine Lines' },
  { value: 'firmness', label: 'Loss of Firmness' },
  { value: 'sensitivity_redness', label: 'Sensitivity/Redness' },
  { value: 'texture_pores', label: 'Texture/Pores' },
  { value: 'tone_glow', label: 'Tone/Glow' },
  { value: 'uneven_skin_tone', label: 'Uneven Skin Tone' },
];

const LIFESTYLE_FACTORS: { value: LifestyleFactor; label: string }[] = [
  { value: 'active_outdoors', label: 'Active Outdoors' },
  { value: 'indoor_work', label: 'Indoor Work' },
  { value: 'frequent_travel', label: 'Frequent Travel' },
  { value: 'stress_management', label: 'Stress Management Focus' },
  { value: 'sleep_quality', label: 'Sleep Quality Focus' },
  { value: 'diet_focus', label: 'Diet/Nutrition Focus' },
];

const ROUTINE_FREQUENCY_OPTIONS = [
  'Daily (morning and night)',
  'Daily (once per day)',
  'Most days (4-6 times per week)',
  'A few times per week (2-3 times)',
  'Occasionally (less than 2 times per week)',
  'I don\'t have a consistent routine',
];

const CLIMATE_OPTIONS = [
  'Hot and humid',
  'Hot and dry',
  'Temperate',
  'Cold and dry',
  'Cold and humid',
  'Variable/Seasonal',
];

const UV_EXPOSURE_OPTIONS = [
  'Minimal (mostly indoors)',
  'Low (15-30 minutes daily)',
  'Moderate (30-60 minutes daily)',
  'High (1-2 hours daily)',
  'Very high (2+ hours daily)',
];

const SLEEP_QUALITY_OPTIONS = [
  'Excellent (8+ hours, restful)',
  'Good (7-8 hours, mostly restful)',
  'Fair (6-7 hours, sometimes restful)',
  'Poor (less than 6 hours or frequently interrupted)',
];

const STRESS_LEVEL_OPTIONS = [
  'Very low',
  'Low',
  'Moderate',
  'High',
  'Very high',
];

// Collapsible Section Component
function CollapsibleSection({
  title,
  description,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  description?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card className="mb-4">
      <div
        className="cursor-pointer p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
        tabIndex={0}
        role="button"
        aria-expanded={isOpen}
      >
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </div>
      {isOpen && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
}

export default function ProfileForm() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile: existingProfile, saveProfile, autoSave, isSaving, error: profileError } = useProfileData();
  const { refreshProfile } = useFocusGroup();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  
  // Collapsible section states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    foundational: true, // Open by default
    routine: false,
    financial: false,
    problem: false,
    language: false,
    painPoint: false,
    influence: false,
    consent: true, // Open by default
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      top_concerns: [],
      lifestyle: [],
      image_consent: false,
      marketing_consent: false,
      data_use_consent: false,
    },
  });

  const topConcerns = watch('top_concerns') || [];
  const lifestyle = watch('lifestyle') || [];
  
  // Track if we've loaded the profile to prevent re-loading
  const profileLoadedRef = useRef<string | null>(null);

  // Load existing profile if editing - use hook data
  useEffect(() => {
    if (existingProfile && profileLoadedRef.current !== existingProfile.id) {
      profileLoadedRef.current = existingProfile.id;
      setIsEditing(true);
      
      // Set all form values from profile
      Object.keys(existingProfile).forEach((key) => {
        if (existingProfile[key as keyof typeof existingProfile] !== null) {
          setValue(key as any, existingProfile[key as keyof typeof existingProfile], { shouldDirty: false });
        }
      });
    }
  }, [existingProfile, setValue]);

  // Note: Redirect logic is handled by FocusGroupClientLayout to prevent loops

  // Auto-save on form changes (debounced) - only for editing existing profiles
  // Use a ref to track if we're already saving to prevent loops
  const isAutoSavingRef = useRef(false);
  const authFailedRef = useRef(false); // Track if auth has failed to prevent repeated attempts
  
  useEffect(() => {
    // Don't auto-save if auth has failed
    if (authFailedRef.current) {
      return;
    }
    
    if (!isEditing || !isDirty || !existingProfile || isAutoSavingRef.current || isSaving) {
      return;
    }

    // Debounce auto-save to avoid too many saves
    const timeoutId = setTimeout(() => {
      if (isAutoSavingRef.current || isSaving || authFailedRef.current) {
        return; // Don't save if already saving or auth failed
      }
      
      isAutoSavingRef.current = true;
      const formValues = watch();
      autoSave(formValues as Partial<ProfileData>)
        .then(() => {
          setShowSavedToast(true);
          setTimeout(() => setShowSavedToast(false), 3000);
          authFailedRef.current = false; // Reset on success
        })
        .catch((err) => {
          // Check if it's an auth error
          const errorMessage = err instanceof Error ? err.message : String(err);
          if (errorMessage.includes('not authenticated') || errorMessage.includes('Auth session')) {
            authFailedRef.current = true; // Stop auto-save on auth failure
            console.warn('Auto-save disabled due to authentication error. Please refresh the page.');
          } else {
            // Other errors - log but don't disable auto-save
            console.error('Auto-save error:', err);
          }
        })
        .finally(() => {
          isAutoSavingRef.current = false;
        });
    }, 2000); // 2 second debounce

    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, isDirty, existingProfile, autoSave, isSaving]);

  const toggleConcern = (concern: SkinConcern) => {
    const current = topConcerns;
    const updated = current.includes(concern)
      ? current.filter((c) => c !== concern)
      : [...current, concern];
    setValue('top_concerns', updated);
  };

  const toggleLifestyle = (factor: LifestyleFactor) => {
    const current = lifestyle;
    const updated = current.includes(factor)
      ? current.filter((f) => f !== factor)
      : [...current, factor];
    setValue('lifestyle', updated);
  };

  const onSubmit = async (data: ProfileData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await saveProfile(data);
      
      // Refresh context to get updated profile status
      await refreshProfile();
      
      // Get updated profile to check if it's now complete
      const supabase = createClientSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('status')
          .eq('user_id', user.id)
          .single();
        
        const isComplete = updatedProfile?.status === 'profile_complete' || 
                           updatedProfile?.status === 'week_active' || 
                           updatedProfile?.status === 'study_complete';
        
        if (isComplete) {
          // Profile is complete - redirect to feedback immediately
          router.replace('/focus-group/feedback');
          return;
        }
      }
      
      if (result?.wasFirstSave) {
        console.log("Redirecting to summary...");
        router.replace('/focus-group/profile/summary');
        return;
      } else {
        // For subsequent saves that don't complete profile, show toast and stay on page
        setShowSavedToast(true);
        setTimeout(() => setShowSavedToast(false), 3000);
      }
    } catch (err: unknown) {
      console.error('Error in onSubmit:', err);
      const message = err instanceof Error ? err.message : 'Failed to save profile. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto">
      {/* Show saved toast */}
      {showSavedToast && (
        <div className="fixed top-20 right-4 z-[9999] animate-in slide-in-from-top-5">
          <div className="p-4 bg-green-50 border-2 border-green-300 rounded-md text-green-800 shadow-xl font-semibold">
            ✓ Changes saved successfully!
          </div>
        </div>
      )}

      {(error || profileError) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error || profileError}
        </div>
      )}

      {/* Show validation errors */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
          <p className="font-semibold mb-2">Please fix the following errors:</p>
          <ul className="list-disc list-inside space-y-1">
            {Object.entries(errors).map(([key, error]) => (
              <li key={key}>
                {key}: {error?.message || 'Invalid value'}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
        <p className="text-gray-600">
          Please provide some information about yourself to help us personalize your experience.
          All fields marked with <span className="text-red-500">*</span> are required.
        </p>
      </div>

      {/* I. Demographic & Foundational Data */}
      <CollapsibleSection
        title="I. Demographic & Foundational Data"
        description="Basic segmentation and physiological relevance"
        isOpen={openSections.foundational}
        onToggle={() => toggleSection('foundational')}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="age_range" className="block text-sm font-medium text-gray-700 mb-2">
              What is your age range? <span className="text-red-500">*</span>
            </label>
            <select
              id="age_range"
              {...register('age_range')}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
            >
              <option value="">Select age range</option>
              {AGE_RANGES.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
            {errors.age_range && (
              <p className="mt-1 text-sm text-red-600">{errors.age_range.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="fitzpatrick_skin_tone" className="block text-sm font-medium text-gray-700 mb-2">
              What is your Fitzpatrick skin type? <span className="text-red-500">*</span>
            </label>
            <select
              id="fitzpatrick_skin_tone"
              {...register('fitzpatrick_skin_tone', { valueAsNumber: true })}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
            >
              <option value="">Select skin tone</option>
              {FITZPATRICK_SCALE.map(({ value, description }) => (
                <option key={value} value={value}>
                  Type {value} - {description}
                </option>
              ))}
            </select>
            {errors.fitzpatrick_skin_tone && (
              <p className="mt-1 text-sm text-red-600">{errors.fitzpatrick_skin_tone.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="gender_identity" className="block text-sm font-medium text-gray-700 mb-2">
              What is your gender identity? (Optional)
            </label>
            <input
              type="text"
              id="gender_identity"
              {...register('gender_identity')}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
              placeholder="e.g., Woman, Man, Non-binary, Prefer not to say"
            />
          </div>

          <div>
            <label htmlFor="ethnic_background" className="block text-sm font-medium text-gray-700 mb-2">
              What is your ethnic or ancestral background? (Optional)
            </label>
            <input
              type="text"
              id="ethnic_background"
              {...register('ethnic_background')}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
              placeholder="e.g., African American, Caribbean, West African, etc."
            />
          </div>

          <div>
            <label htmlFor="skin_type" className="block text-sm font-medium text-gray-700 mb-2">
              How would you describe your skin type? (Optional)
            </label>
            <select
              id="skin_type"
              {...register('skin_type')}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
            >
              <option value="">Select skin type</option>
              {SKIN_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-2">
              What are your top skin concerns? <span className="text-red-500">*</span>
            </legend>
            <p className="text-xs text-gray-500 mb-3">Select at least one concern (you can select multiple)</p>
            <div className="grid grid-cols-2 gap-2">
              {SKIN_CONCERNS.map(({ value, label }) => (
                <label
                  key={value}
                  className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={topConcerns.includes(value)}
                    onChange={() => toggleConcern(value)}
                    className="w-4 h-4 text-[#C9A66B] border-gray-300 rounded focus:ring-[#C9A66B]"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
            {errors.top_concerns && (
              <p className="mt-1 text-sm text-red-600">{errors.top_concerns.message}</p>
            )}
          </fieldset>

          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-2">
              Which lifestyle factors apply to you? (Optional)
            </legend>
            <p className="text-xs text-gray-500 mb-3">Select any factors that apply to you</p>
            <div className="grid grid-cols-2 gap-2">
              {LIFESTYLE_FACTORS.map(({ value, label }) => (
                <label
                  key={value}
                  className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={lifestyle.includes(value)}
                    onChange={() => toggleLifestyle(value)}
                    className="w-4 h-4 text-[#C9A66B] border-gray-300 rounded focus:ring-[#C9A66B]"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="climate_exposure" className="block text-sm font-medium text-gray-700 mb-2">
              What best describes your typical climate exposure? (Optional)
            </label>
            <select
              id="climate_exposure"
              {...register('climate_exposure')}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
            >
              <option value="">Select climate</option>
              {CLIMATE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="uv_exposure" className="block text-sm font-medium text-gray-700 mb-2">
              How much daily UV exposure do you typically get? (Optional)
            </label>
            <select
              id="uv_exposure"
              {...register('uv_exposure')}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
            >
              <option value="">Select UV exposure</option>
              {UV_EXPOSURE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sleep_quality" className="block text-sm font-medium text-gray-700 mb-2">
              How would you rate your sleep quality? (Optional)
            </label>
            <select
              id="sleep_quality"
              {...register('sleep_quality')}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
            >
              <option value="">Select sleep quality</option>
              {SLEEP_QUALITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="stress_level" className="block text-sm font-medium text-gray-700 mb-2">
              How would you describe your stress level? (Optional)
            </label>
            <select
              id="stress_level"
              {...register('stress_level')}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
            >
              <option value="">Select stress level</option>
              {STRESS_LEVEL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CollapsibleSection>

      {/* II. Current Routine & Ritual */}
      <CollapsibleSection
        title="II. Current Routine & Ritual"
        description="Understand current behavior, switching cost, and compatibility"
        isOpen={openSections.routine}
        onToggle={() => toggleSection('routine')}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="current_routine" className="block text-sm font-medium text-gray-700 mb-2">
              Walk me through your skincare routine—morning and night. (Optional)
            </label>
            <textarea
              id="current_routine"
              {...register('current_routine')}
              rows={4}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
              placeholder="Describe your morning and evening skincare steps..."
            />
          </div>

          <div>
            <label htmlFor="routine_frequency" className="block text-sm font-medium text-gray-700 mb-2">
              How often do you follow this routine? (Optional)
            </label>
            <select
              id="routine_frequency"
              {...register('routine_frequency')}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
            >
              <option value="">Select frequency</option>
              {ROUTINE_FREQUENCY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="known_sensitivities" className="block text-sm font-medium text-gray-700 mb-2">
              Do you have any known product sensitivities? (Optional)
            </label>
            <input
              type="text"
              id="known_sensitivities"
              {...register('known_sensitivities')}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
              placeholder="e.g., Fragrance, Retinoids, Essential oils..."
            />
          </div>

          <div>
            <label htmlFor="product_use_history" className="block text-sm font-medium text-gray-700 mb-2">
              Which skincare actives or brands have you used recently? (Optional)
            </label>
            <input
              type="text"
              id="product_use_history"
              {...register('product_use_history')}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
              placeholder="e.g., Niacinamide, The Ordinary, CeraVe..."
            />
          </div>

          <div>
            <label htmlFor="ideal_routine" className="block text-sm font-medium text-gray-700 mb-2">
              Describe your ideal skincare routine. (Optional)
            </label>
            <textarea
              id="ideal_routine"
              {...register('ideal_routine')}
              rows={3}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
              placeholder="What would your perfect routine look like?"
            />
          </div>

          <div>
            <label htmlFor="ideal_product" className="block text-sm font-medium text-gray-700 mb-2">
              What would your ideal skincare product do for your skin? (Optional)
            </label>
            <textarea
              id="ideal_product"
              {...register('ideal_product')}
              rows={3}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
              placeholder="Describe the benefits you're looking for..."
            />
          </div>

          <div>
            <label htmlFor="routine_placement_insight" className="block text-sm font-medium text-gray-700 mb-2">
              Where in your current routine would an &quot;elixir&quot; fit, or what would make you hesitate to add it? (Optional)
            </label>
            <textarea
              id="routine_placement_insight"
              {...register('routine_placement_insight')}
              rows={3}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
              placeholder="Share your thoughts on how an elixir would fit into your routine..."
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* III. Financial Commitment & Value Perception */}
      <CollapsibleSection
        title="III. Financial Commitment & Value Perception"
        description="Establish purchasing power, price thresholds, and perceived value"
        isOpen={openSections.financial}
        onToggle={() => toggleSection('financial')}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="avg_spend_per_item" className="block text-sm font-medium text-gray-700 mb-2">
              What is the most you currently spend on a single skincare item (serum, oil, or treatment)? (Optional)
            </label>
            <input
              type="number"
              id="avg_spend_per_item"
              step="0.01"
              min="0"
              {...register('avg_spend_per_item', { valueAsNumber: true })}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="annual_skincare_spend" className="block text-sm font-medium text-gray-700 mb-2">
              Approximately how much do you spend on skincare annually? (Optional)
            </label>
            <input
              type="number"
              id="annual_skincare_spend"
              step="0.01"
              min="0"
              {...register('annual_skincare_spend', { valueAsNumber: true })}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="max_spend_motivation" className="block text-sm font-medium text-gray-700 mb-2">
              When you made your most expensive skincare purchase, what outcome or benefit justified that price? (Optional)
            </label>
            <textarea
              id="max_spend_motivation"
              {...register('max_spend_motivation')}
              rows={3}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
              placeholder="What made that purchase worth it?"
            />
          </div>

          <div>
            <label htmlFor="value_stickiness" className="block text-sm font-medium text-gray-700 mb-2">
              If you could no longer use that expensive product, would you feel disappointed or easily replace it? Why? (Optional)
            </label>
            <textarea
              id="value_stickiness"
              {...register('value_stickiness')}
              rows={3}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
              placeholder="Share your thoughts..."
            />
          </div>

          <div>
            <label htmlFor="pricing_threshold_proof" className="block text-sm font-medium text-gray-700 mb-2">
              If a new product promised the same results but cost 20% more, what proof would you need to justify it? (Optional)
            </label>
            <textarea
              id="pricing_threshold_proof"
              {...register('pricing_threshold_proof')}
              rows={3}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
              placeholder="What evidence would convince you?"
            />
          </div>

          <div>
            <label htmlFor="category_premium_insight" className="block text-sm font-medium text-gray-700 mb-2">
              Do you consider &quot;elixirs&quot; or &quot;ampoules&quot; premium categories, and what makes them worth more to you? (Optional)
            </label>
            <textarea
              id="category_premium_insight"
              {...register('category_premium_insight')}
              rows={3}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
              placeholder="Share your perspective on premium skincare categories..."
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* IV. Problem Validation & Performance Expectations */}
      <CollapsibleSection
        title="IV. Problem Validation & Performance Expectations"
        description="Identify the user's core pain point and measurable success criteria"
        isOpen={openSections.problem}
        onToggle={() => toggleSection('problem')}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="unmet_need" className="block text-sm font-medium text-gray-700 mb-2">
              What&apos;s the most frustrating, unmet need you have regarding your skin&apos;s health or appearance? (Optional)
            </label>
            <textarea
              id="unmet_need"
              {...register('unmet_need')}
              rows={4}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
              placeholder="Describe your biggest skin concern or frustration..."
            />
          </div>

          <div>
            <label htmlFor="money_spent_trying" className="block text-sm font-medium text-gray-700 mb-2">
              What have you already spent money on trying to solve this? (Optional)
            </label>
            <textarea
              id="money_spent_trying"
              {...register('money_spent_trying')}
              rows={3}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
              placeholder="List products, treatments, or services you've tried..."
            />
          </div>

          <div>
            <label htmlFor="performance_expectation" className="block text-sm font-medium text-gray-700 mb-2">
              What visible or emotional change would you need to see—and how quickly—to believe an &quot;elixir&quot; is worth purchasing monthly? (Optional)
            </label>
            <textarea
              id="performance_expectation"
              {...register('performance_expectation')}
              rows={4}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
              placeholder="Describe your expectations for results and timeline..."
            />
          </div>

          <div>
            <label htmlFor="drop_off_reason" className="block text-sm font-medium text-gray-700 mb-2">
              What would make you stop using it after a week? (Optional)
            </label>
            <textarea
              id="drop_off_reason"
              {...register('drop_off_reason')}
              rows={3}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
              placeholder="What would cause you to discontinue use?"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* V. Language, Identity & Brand Association */}
      <CollapsibleSection
        title="V. Language, Identity & Brand Association"
        description="Test brand resonance and symbolic perception"
        isOpen={openSections.language}
        onToggle={() => toggleSection('language')}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="elixir_association" className="block text-sm font-medium text-gray-700 mb-2">
              When you hear the word &quot;elixir,&quot; what benefits or emotions come to mind? (Optional)
            </label>
            <textarea
              id="elixir_association"
              {...register('elixir_association')}
              rows={3}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
              placeholder="What does 'elixir' mean to you?"
            />
          </div>

          <div>
            <label htmlFor="elixir_ideal_user" className="block text-sm font-medium text-gray-700 mb-2">
              Who do you picture using an &quot;elixir&quot;? (Optional)
            </label>
            <textarea
              id="elixir_ideal_user"
              {...register('elixir_ideal_user')}
              rows={3}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
              placeholder="Describe the person you imagine using an elixir..."
            />
          </div>

          <div>
            <label htmlFor="favorite_brand" className="block text-sm font-medium text-gray-700 mb-2">
              Is there a skincare brand you particularly like? (Optional)
            </label>
            <input
              type="text"
              id="favorite_brand"
              {...register('favorite_brand')}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
              placeholder="Brand name"
            />
          </div>

          <div>
            <label htmlFor="favorite_brand_reason" className="block text-sm font-medium text-gray-700 mb-2">
              What makes you like that brand? (Optional)
            </label>
            <textarea
              id="favorite_brand_reason"
              {...register('favorite_brand_reason')}
              rows={3}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
              placeholder="What draws you to this brand?"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* VI. Pain Point & Ingredient Sophistication */}
      <CollapsibleSection
        title="VI. Pain Point & Ingredient Sophistication"
        description="Validate product–problem alignment and literacy level"
        isOpen={openSections.painPoint}
        onToggle={() => toggleSection('painPoint')}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="specific_pain_point" className="block text-sm font-medium text-gray-700 mb-2">
              What&apos;s one specific, persistent issue you believe a high-performance elixir could fix? (Optional)
            </label>
            <textarea
              id="specific_pain_point"
              {...register('specific_pain_point')}
              rows={3}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
              placeholder="Describe a specific skin issue you'd like to address..."
            />
          </div>

          <div>
            <label htmlFor="ingredient_awareness" className="block text-sm font-medium text-gray-700 mb-2">
              What ingredient names do you look for when shopping for skincare? (Optional)
            </label>
            <input
              type="text"
              id="ingredient_awareness"
              {...register('ingredient_awareness')}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
              placeholder="e.g., Niacinamide, Retinol, Hyaluronic Acid, Vitamin C..."
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* VII. Influence, Advocacy & Effort */}
      <CollapsibleSection
        title="VII. Influence, Advocacy & Effort"
        description="Identify early evangelists and product optimizers"
        isOpen={openSections.influence}
        onToggle={() => toggleSection('influence')}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="research_effort_score" className="block text-sm font-medium text-gray-700 mb-2">
              On a scale of 1–10, how much effort or research do you put into your skincare choices? (Optional)
            </label>
            <input
              type="number"
              id="research_effort_score"
              min="1"
              max="10"
              {...register('research_effort_score', { valueAsNumber: true })}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
              placeholder="1-10"
            />
            <p className="text-xs text-gray-500 mt-1">1 = Minimal research, 10 = Extensive research</p>
          </div>

          <div>
            <label htmlFor="influence_count" className="block text-sm font-medium text-gray-700 mb-2">
              How many friends, family, or followers have asked you for skincare advice in the last six months? (Optional)
            </label>
            <input
              type="number"
              id="influence_count"
              min="0"
              {...register('influence_count', { valueAsNumber: true })}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
              placeholder="0"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('brand_switch_influence')}
                className="w-4 h-4 text-[#C9A66B] border-gray-300 rounded focus:ring-[#C9A66B]"
              />
              <span className="text-sm text-gray-700">
                Have you ever convinced someone to switch skincare brands? (Optional)
              </span>
            </label>
          </div>
        </div>
      </CollapsibleSection>

      {/* VIII. Participation & Consent */}
      <CollapsibleSection
        title="VIII. Participation & Consent"
        description="Legal, tracking, and compliance"
        isOpen={openSections.consent}
        onToggle={() => toggleSection('consent')}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="image_consent"
              {...register('image_consent')}
              className="mt-1 w-4 h-4 text-[#C9A66B] border-gray-300 rounded focus:ring-[#C9A66B]"
            />
            <label htmlFor="image_consent" className="text-sm text-gray-700">
              <span className="font-medium">Image Consent</span>{' '}
              <span className="text-red-500">*</span>
              <p className="text-xs text-gray-500 mt-1">
                I consent to NFE using my uploaded images for research and product development
                purposes. Images will be stored securely and used only for the stated purposes.
              </p>
            </label>
          </div>
          {errors.image_consent && (
            <p className="text-sm text-red-600 ml-7">{errors.image_consent.message}</p>
          )}

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="marketing_consent"
              {...register('marketing_consent')}
              className="mt-1 w-4 h-4 text-[#C9A66B] border-gray-300 rounded focus:ring-[#C9A66B]"
            />
            <label htmlFor="marketing_consent" className="text-sm text-gray-700">
              <span className="font-medium">Marketing Consent (Optional)</span>
              <p className="text-xs text-gray-500 mt-1">
                I consent to receiving marketing communications from NFE about products, research
                updates, and special offers.
              </p>
            </label>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="data_use_consent"
              {...register('data_use_consent')}
              className="mt-1 w-4 h-4 text-[#C9A66B] border-gray-300 rounded focus:ring-[#C9A66B]"
            />
            <label htmlFor="data_use_consent" className="text-sm text-gray-700">
              <span className="font-medium">Data Use Consent (Optional)</span>
              <p className="text-xs text-gray-500 mt-1">
                I consent to my anonymized data being used for ingredient research correlations.
              </p>
            </label>
          </div>
        </div>
      </CollapsibleSection>

      <div className="flex gap-4 pt-4">
        <Button type="submit" variant="primary" disabled={loading || isSaving} className="flex-1">
          {(loading || isSaving) ? 'Saving...' : isEditing ? 'Update Profile' : 'Save Profile'}
        </Button>
        {isEditing && (
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/focus-group/feedback')}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
