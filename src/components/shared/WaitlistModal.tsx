'use client';

import { useState } from 'react';
import { useWaitlistStore } from '@/store/useWaitlistStore';

export default function WaitlistModal() {
  const { isOpen, close } = useWaitlistStore();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      // Add timeout to prevent hanging (increased to 30 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          product: 'face-elixir',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('[WaitlistModal] Response status:', res.status, 'ok:', res.ok);

      if (res.ok) {
        // Read the response to ensure it's complete before updating state
        try {
          const data = await res.json();
          console.log('[WaitlistModal] Success response:', data);
        } catch (e) {
          // Response might not have JSON body, that's okay
          console.log('[WaitlistModal] No JSON body in response');
        }
        // Update status after response is fully consumed
        setStatus('success');
        // User will manually close with the Close button
      } else {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[WaitlistModal] Error response:', data);
        setStatus('error');
        // Check for duplicate error
        if (res.status === 409 && data.code === "duplicate") {
          setErrorMessage(data.message || "This email address is already on the list.");
        } else {
          setErrorMessage(data.error || 'Something went wrong. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Waitlist submission error:', error);
      setStatus('error');
      if (error.name === 'AbortError') {
        setErrorMessage('Request timed out. Please try again.');
      } else {
        setErrorMessage('Unable to connect. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
        <button
          onClick={close}
          className="absolute top-3 right-3 text-2xl font-bold text-[#0F2C1C] hover:text-[#0F2C1C]/70 transition"
          aria-label="Close waitlist modal"
        >
          ×
        </button>

        {status === 'success' ? (
          <div className="text-center py-6">
            <div className="text-6xl mb-4 text-green-600">✓</div>
            <h2 className="text-2xl font-semibold text-green-800 mb-3">
              You&apos;ve been added to the Face Elixir waitlist.
            </h2>
            <p className="text-gray-700 mb-2 text-base">
              Thank you for your interest in the NFE Face Elixir.
            </p>
            <p className="text-gray-600 mb-6">
              We&apos;ll notify you as soon as it launches.
            </p>
            <button
              onClick={() => {
                close();
                setEmail('');
                setStatus('idle');
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4 text-[#0F2C1C]">
              Be the first to experience the NFE Face Elixir
            </h2>

            <p className="text-gray-600 mb-4 text-sm">
              Join our waitlist to be notified when this product launches.
            </p>

            <label htmlFor="waitlist-email" className="sr-only">
              Email address
            </label>
            <input
              id="waitlist-email"
              type="email"
              placeholder="Enter your email"
              className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#CDA64D]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />

            <button
              onClick={handleSubmit}
              disabled={status === 'loading' || !email}
              className="w-full py-2 bg-[#CDA64D] text-white rounded font-medium hover:bg-[#b78f3c] transition focus:outline-none focus:ring-2 focus:ring-[#CDA64D] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Submitting...' : 'Join Waitlist'}
            </button>

            {status === 'error' && errorMessage && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-center">
                <p className="text-red-600 text-sm font-medium">
                  {errorMessage}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

