/**
 * Validation Schemas for NFE Portal
 * Using Zod for type-safe validation
 */

import { z } from 'zod';

// Newsletter Signup Schema
export const newsletterSignupSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email address is too long'),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),
  consent: z
    .boolean()
    .refine((val) => val === true, 'You must agree to receive communications'),
});

export type NewsletterSignupData = z.infer<typeof newsletterSignupSchema>;

// Contact Form Schema
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email address is too long'),
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject is too long'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message is too long'),
  consent: z
    .boolean()
    .refine((val) => val === true, 'You must agree to the privacy policy'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Focus Group Application Schema
export const focusGroupApplicationSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name is too long'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name is too long'),
  age: z
    .number()
    .min(18, 'You must be at least 18 years old')
    .max(100, 'Please enter a valid age'),
  skinType: z.enum(['oily', 'dry', 'combination', 'sensitive', 'normal'], {
    required_error: 'Please select your skin type',
  }),
  skinTone: z.enum(['light', 'medium', 'medium-dark', 'dark', 'very-dark'], {
    required_error: 'Please select your skin tone',
  }),
  concerns: z
    .array(z.string())
    .min(1, 'Please select at least one skin concern')
    .max(5, 'Please select no more than 5 concerns'),
  researchInterest: z
    .string()
    .min(10, 'Please provide more details about your research interest')
    .max(500, 'Response is too long'),
  consent: z
    .boolean()
    .refine((val) => val === true, 'You must agree to participate in research'),
  privacyConsent: z
    .boolean()
    .refine((val) => val === true, 'You must agree to the privacy policy'),
});

export type FocusGroupApplicationData = z.infer<typeof focusGroupApplicationSchema>;

// Product Review Schema
export const productReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z
    .number()
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars'),
  title: z
    .string()
    .min(5, 'Review title must be at least 5 characters')
    .max(100, 'Review title is too long'),
  review: z
    .string()
    .min(10, 'Review must be at least 10 characters')
    .max(1000, 'Review is too long'),
  skinType: z.enum(['oily', 'dry', 'combination', 'sensitive', 'normal']).optional(),
  skinTone: z.enum(['light', 'medium', 'medium-dark', 'dark', 'very-dark']).optional(),
  wouldRecommend: z.boolean(),
  consent: z
    .boolean()
    .refine((val) => val === true, 'You must agree to the terms'),
});

export type ProductReviewData = z.infer<typeof productReviewSchema>;

// Search Query Schema
export const searchQuerySchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Search query is too long')
    .regex(/^[a-zA-Z0-9\s-]+$/, 'Search query contains invalid characters'),
  category: z.enum(['products', 'articles', 'science', 'all']).optional(),
  sortBy: z.enum(['relevance', 'date', 'title']).optional(),
});

export type SearchQueryData = z.infer<typeof searchQuerySchema>;

// Utility function to get field errors
export function getFieldError(
  errors: Record<string, Array<{ message?: string }>> | null | undefined,
  fieldName: string
): string | undefined {
  return errors?.[fieldName]?.[0]?.message;
}

// Utility function to check if form has errors
export function hasFormErrors(
  errors: Record<string, unknown> | null | undefined
): boolean {
  return Object.keys(errors || {}).length > 0;
}

// Focus Group Profile Schema
export const profileSchema = z.object({
  // Required foundational fields
  age_range: z.enum(['18-25', '26-35', '36-45', '46-55', '56+'], {
    required_error: 'Please select your age range',
  }),
  fitzpatrick_skin_tone: z
    .number()
    .min(1, 'Skin tone must be between 1 and 6')
    .max(6, 'Skin tone must be between 1 and 6'),
  top_concerns: z
    .array(z.string())
    .min(1, 'Please select at least one skin concern')
    .max(8, 'Please select no more than 8 concerns'),
  image_consent: z.boolean().refine((val) => val === true, {
    message: 'You must consent to image usage to participate',
  }),
  
  // Optional foundational fields
  gender_identity: z.string().optional(),
  ethnic_background: z.string().optional(),
  skin_type: z.enum(['Dry', 'Oily', 'Combination', 'Normal', 'Sensitive']).optional(),
  lifestyle: z.array(z.string()).optional(),
  climate_exposure: z.string().optional(),
  uv_exposure: z.string().optional(),
  sleep_quality: z.string().optional(),
  stress_level: z.string().optional(),
  
  // Routine & ritual fields (all optional)
  current_routine: z.string().optional(),
  routine_frequency: z.string().optional(),
  known_sensitivities: z.string().optional(),
  product_use_history: z.string().optional(),
  ideal_routine: z.string().optional(),
  ideal_product: z.string().optional(),
  routine_placement_insight: z.string().optional(),
  
  // Financial commitment fields (all optional)
  avg_spend_per_item: z.number().min(0).optional(),
  annual_skincare_spend: z.number().min(0).optional(),
  max_spend_motivation: z.string().optional(),
  value_stickiness: z.string().optional(),
  pricing_threshold_proof: z.string().optional(),
  category_premium_insight: z.string().optional(),
  
  // Problem validation fields (all optional)
  unmet_need: z.string().optional(),
  money_spent_trying: z.string().optional(),
  performance_expectation: z.string().optional(),
  drop_off_reason: z.string().optional(),
  
  // Language & identity fields (all optional)
  elixir_association: z.string().optional(),
  elixir_ideal_user: z.string().optional(),
  favorite_brand: z.string().optional(),
  favorite_brand_reason: z.string().optional(),
  
  // Pain point & ingredient fields (all optional)
  specific_pain_point: z.string().optional(),
  ingredient_awareness: z.string().optional(),
  
  // Influence & advocacy fields (all optional)
  research_effort_score: z.number().min(1).max(10).optional(),
  influence_count: z.number().min(0).optional(),
  brand_switch_influence: z.boolean().optional(),
  
  // Consent fields
  marketing_consent: z.boolean().optional(),
  data_use_consent: z.boolean().optional(),
});

export type ProfileData = z.infer<typeof profileSchema>;

// Focus Group Feedback Schema
export const feedbackSchema = z.object({
  week_number: z
    .number()
    .min(1, 'Week number must be at least 1')
    .max(52, 'Week number cannot exceed 52'),
  hydration_rating: z
    .number()
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
  tone_rating: z
    .number()
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
  texture_rating: z
    .number()
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
  overall_rating: z
    .number()
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
  notes: z.string().max(2000, 'Notes cannot exceed 2000 characters').optional(),
});

export type FeedbackData = z.infer<typeof feedbackSchema>;

// Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
});

export type LoginData = z.infer<typeof loginSchema>;

// Register Schema
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password is too long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterData = z.infer<typeof registerSchema>;

// Focus Group Feedback Schema
export const focusGroupFeedbackSchema = z.object({
  week_number: z
    .number()
    .min(1, 'Week number must be at least 1')
    .max(52, 'Week number cannot exceed 52'),
  product_usage: z.string().max(1000, 'Product usage description is too long').optional(),
  perceived_changes: z.string().max(2000, 'Perceived changes description is too long').optional(),
  concerns_or_issues: z.string().max(2000, 'Concerns description is too long').optional(),
  emotional_response: z.string().max(2000, 'Emotional response description is too long').optional(),
  overall_rating: z
    .number()
    .min(1, 'Rating must be between 1 and 10')
    .max(10, 'Rating must be between 1 and 10')
    .optional(),
  next_week_focus: z.string().max(1000, 'Next week focus description is too long').optional(),
});

export type FocusGroupFeedbackData = z.infer<typeof focusGroupFeedbackSchema>;

// Focus Group Upload Schema
export const focusGroupUploadSchema = z.object({
  week_number: z
    .number()
    .min(1, 'Week number must be at least 1')
    .max(52, 'Week number cannot exceed 52'),
  notes: z.string().max(1000, 'Notes are too long').optional(),
  consent_given: z.boolean().refine((val) => val === true, {
    message: 'You must consent to image usage',
  }),
});

export type FocusGroupUploadData = z.infer<typeof focusGroupUploadSchema>;