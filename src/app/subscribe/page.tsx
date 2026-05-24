"use client";

import { useState } from "react";
import Link from "next/link";

export default function SubscribePage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle"); // Reset status
    setErrorMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatus("success");
        setEmail("");
      } else {
        const data = await res.json().catch(() => ({ error: "Unknown error" }));
        // Check for duplicate error
        if (res.status === 409 && data.code === "duplicate") {
          setStatus("error");
          setErrorMessage(data.message || "This email address is already on the list.");
        } else {
          setStatus("error");
          setErrorMessage(data.error || "Something went wrong. Please try again.");
        }
      }
    } catch (error) {
      console.error("Subscribe form error:", error);
      setStatus("error");
      setErrorMessage("Unable to connect. Please try again.");
    }
  }

  return (
    <div className="max-w-xl mx-auto py-24">
      <h1 className="text-4xl font-serif text-green-900 mb-6">
        Join the NFE Community
      </h1>

      <p className="text-lg text-gray-700 mb-8">
        Subscribe for occasional, thoughtful notes on caring for mature melanated skin—plus behind-the-scenes updates as NFE evolves. No spam, no pressure. Just honest skin wisdom when I have something meaningful to share.
      </p>

      <div role="status" aria-live="polite" aria-atomic="true">
        {status === "success" && (
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">✓</div>
            <h2 className="text-2xl font-semibold text-green-800 mb-2">
              Successfully Subscribed!
            </h2>
            <p className="text-green-700 mb-4">
              Thank you for joining the NFE community. Check your inbox for a confirmation email.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="text-green-700 underline hover:text-green-900 transition"
            >
              Subscribe another email
            </button>
          </div>
        )}
      </div>

      {status !== "success" && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label htmlFor="subscribe-email" className="sr-only">
            Email address
          </label>
          <input
            id="subscribe-email"
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-nfe-gold"
            placeholder="Your email"
          />

          <button
            type="submit"
            disabled={status === "idle" && !email}
            className="bg-nfe-gold text-white font-medium py-3 rounded hover:bg-nfe-gold-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Subscribe
          </button>

          <p className="text-xs text-gray-500">
            By subscribing, you agree to our{' '}
            <Link href="/privacy" className="underline hover:no-underline">
              Privacy Policy
            </Link>
            . No spam, ever.
          </p>

          {status === "error" && errorMessage && (
            <div role="alert" className="bg-red-50 border border-red-300 rounded p-4 text-center">
              <p className="text-red-600 font-medium">{errorMessage}</p>
            </div>
          )}
        </form>
      )}
    </div>
  );
}

