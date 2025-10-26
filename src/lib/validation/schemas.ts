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
export function getFieldError(errors: any, fieldName: string): string | undefined {
  return errors?.[fieldName]?.[0]?.message;
}

// Utility function to check if form has errors
export function hasFormErrors(errors: any): boolean {
  return Object.keys(errors || {}).length > 0;
}
