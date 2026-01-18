"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

const AGE_RANGES = [
  "Under 30",
  "30–39",
  "40–49",
  "50–59",
  "60–69",
  "70+",
];

const SKIN_CONCERNS = [
  "Dryness / Dehydration",
  "Hyperpigmentation / Dark Spots",
  "Loss of Firmness / Elasticity",
  "Dullness",
  "Texture / Roughness",
  "Sensitivity",
  "Fine Lines & Wrinkles",
];

export default function CommunityInputPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    ageRange: "",
    skinDescription: "",
    concerns: [] as string[],
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      const res = await fetch("/api/community-input", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Submission failed");
      
      setStatus("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const toggleConcern = (concern: string) => {
    setFormData(prev => ({
      ...prev,
      concerns: prev.concerns.includes(concern)
        ? prev.concerns.filter(c => c !== concern)
        : [...prev.concerns, concern]
    }));
  };

  if (status === "success") {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl font-serif text-[#1B3A34] mb-6">Thank you for sharing with me.</h1>
        <p className="text-lg text-gray-700 leading-relaxed mb-8">
          NFE is intentionally moving at a thoughtful, unhurried pace. Your input helps me decide what’s worth creating next for mature melanated skin—and how to do it in a way that respects your time, money, and trust.
        </p>
        <p className="text-lg text-[#1B3A34] font-medium">
          With gratitude,<br />
          Vanessa
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 md:py-24">
      <h1 className="text-4xl md:text-5xl font-serif text-[#1B3A34] mb-8">
        Community Input: Help Shape NFE
      </h1>

      <div className="prose prose-lg text-gray-700 mb-12">
        <p>
          NFE is currently in a quiet development chapter. I’m refining formulas and future offerings for mature melanated skin, and real-life experiences are my most valuable data.
        </p>
        <p>
          If you’re open to sharing your skin story, concerns, and what you wish existed for your routine, I’d love to hear from you. Your input helps me decide what to build next—at a pace that’s sustainable and honest for me.
        </p>
        <p className="text-sm bg-[#F6F5F3] p-6 rounded-lg border border-[#E5E5E5]">
          <strong>You can share as much or as little as you’d like. Helpful topics include:</strong><br/>
          – Your age range and how you describe your skin<br/>
          – Your top 1–3 skin concerns<br/>
          – What you’re currently using and what still feels like it’s missing<br/>
          – Anything you’d love a brand like NFE to create for mature melanated skin.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
            <input
              id="name"
              type="text"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C6A664] focus:border-transparent"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C6A664] focus:border-transparent"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="ageRange" className="block text-sm font-medium text-gray-700">Age Range</label>
          <select
            id="ageRange"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C6A664] focus:border-transparent bg-white"
            value={formData.ageRange}
            onChange={e => setFormData({...formData, ageRange: e.target.value})}
          >
            <option value="">Select an option...</option>
            {AGE_RANGES.map(age => (
              <option key={age} value={age}>{age}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="skinDescription" className="block text-sm font-medium text-gray-700">
            How would you describe your skin?
            <span className="block text-xs font-normal text-gray-500 mt-1">(e.g., dry, oily, combination, sensitive, etc.)</span>
          </label>
          <input
            id="skinDescription"
            type="text"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C6A664] focus:border-transparent"
            value={formData.skinDescription}
            onChange={e => setFormData({...formData, skinDescription: e.target.value})}
          />
        </div>

        <div className="space-y-3">
          <div className="block text-sm font-medium text-gray-700">Top Skin Concerns (Select all that apply)</div>
          <div className="grid md:grid-cols-2 gap-3">
            {SKIN_CONCERNS.map(concern => (
              <label key={concern} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#1B3A34] border-gray-300 rounded focus:ring-[#C6A664]"
                  checked={formData.concerns.includes(concern)}
                  onChange={() => toggleConcern(concern)}
                />
                <span className="text-sm text-gray-700">{concern}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Anything else you&apos;d like to share?
            <span className="block text-xs font-normal text-gray-500 mt-1">What products are you currently using? What feels missing from your routine? What do you wish existed?</span>
          </label>
          <textarea
            id="message"
            rows={5}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C6A664] focus:border-transparent"
            value={formData.message}
            onChange={e => setFormData({...formData, message: e.target.value})}
          />
        </div>

        {status === "error" && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
            Something went wrong. Please try again.
          </div>
        )}

        <Button
          type="submit"
          disabled={status === "submitting"}
          className="w-full md:w-auto px-8 py-4 bg-[#1B3A34] text-[#D6B370] text-lg rounded-xl hover:bg-[#2A4C44] transition-colors disabled:opacity-50"
        >
          {status === "submitting" ? "Sending..." : "Share My Input"}
        </Button>
      </form>
    </div>
  );
}

