'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { newsletterSignupSchema, type NewsletterSignupData } from '@/lib/validation/schemas';
import { trackNewsletterSubscription, trackFormSubmission } from '@/lib/analytics';
import { Mail, Check, XCircle, AlertCircle, Loader2 } from '../ui/Icon';

interface NewsletterSignupProps {
  className?: string;
  variant?: 'default' | 'inline' | 'modal';
  onSuccess?: () => void;
}

export function NewsletterSignup({ 
  className = '', 
  variant = 'default',
  onSuccess 
}: NewsletterSignupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewsletterSignupData>({
    resolver: zodResolver(newsletterSignupSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: NewsletterSignupData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe to newsletter');
      }

      // Track successful submission
      trackNewsletterSubscription();
      trackFormSubmission('newsletter', true);

      setIsSubmitted(true);
      reset();
      onSuccess?.();

      // Reset success state after 3 seconds
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setSubmitError('Something went wrong. Please try again.');
      trackFormSubmission('newsletter', false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={`newsletter-success ${className}`}>
        <div className="flex items-center gap-3 text-nfe-green">
          <Check size="lg" aria-hidden="true" />
          <p className="font-medium">Thank you for subscribing!</p>
        </div>
        <p className="text-sm text-nfe-muted mt-1">
          You&apos;ll receive our latest updates and research insights.
        </p>
      </div>
    );
  }

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)}
      className={`newsletter-signup ${className}`}
      noValidate
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-nfe-ink mb-2">
            Join Our Research Community
          </h3>
          <p className="text-sm text-nfe-muted">
            Get updates on our latest research, product launches, and exclusive content.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            {...register('firstName')}
            label="First Name"
            type="text"
            placeholder="Enter your first name"
            error={errors.firstName?.message}
            required
            disabled={isSubmitting}
          />

          <Input
            {...register('email')}
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            error={errors.email?.message}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="flex items-start gap-3">
          <input
            {...register('consent')}
            type="checkbox"
            id="newsletter-consent"
            className="mt-1 h-4 w-4 text-nfe-green border-gray-300 rounded focus:ring-nfe-gold focus:ring-2"
            disabled={isSubmitting}
          />
          <label 
            htmlFor="newsletter-consent" 
            className="text-sm text-nfe-muted cursor-pointer"
          >
            I agree to receive marketing communications from NFE Beauty. 
            You can unsubscribe at any time. 
            <a 
              href="/privacy" 
              className="text-nfe-gold hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
          </label>
        </div>

        {errors.consent && (
          <p className="text-sm text-red-600" role="alert">
            {errors.consent.message}
          </p>
        )}

        {submitError && (
          <div className="flex items-center gap-2 text-red-600" role="alert">
            <AlertCircle size="sm" aria-hidden="true" />
            <p className="text-sm">{submitError}</p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 size="sm" className="animate-spin mr-2" />
              Subscribing...
            </>
          ) : (
            <>
              <Mail size="sm" className="mr-2" />
              Subscribe
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// Inline variant for use in sidebars or smaller spaces
export function NewsletterSignupInline({ className = '' }: { className?: string }) {
  return (
    <NewsletterSignup 
      variant="inline" 
      className={`newsletter-signup-inline ${className}`}
    />
  );
}

// Modal variant for popup subscriptions
export function NewsletterSignupModal({ className = '' }: { className?: string }) {
  return (
    <div className={`newsletter-signup-modal ${className}`}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-nfe-ink mb-2">
          Stay Connected
        </h2>
        <p className="text-nfe-muted">
          Join our community for exclusive research updates and skincare insights.
        </p>
      </div>
      <NewsletterSignup variant="modal" />
    </div>
  );
}
