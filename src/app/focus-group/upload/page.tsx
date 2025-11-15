'use client';

import React from 'react';
import UploadForm from '@/components/focus-group/UploadForm';
import UploadGallery from '@/components/focus-group/UploadGallery';
import Link from 'next/link';

export default function UploadPage() {
  const handleSuccess = () => {
    // Gallery will reload automatically via useEffect
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-primary font-bold text-[#0E2A22] mb-2">
          Upload Progress Images
        </h1>
        <p className="text-gray-600">
          Upload photos showing your progress. We recommend taking photos from the front, left,
          and right angles for best tracking.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload Form */}
        <div>
          <UploadForm onSuccess={handleSuccess} />
        </div>

        {/* Upload Gallery */}
        <div>
          <UploadGallery />
        </div>
      </div>

      {/* Navigation Link */}
      <div className="mt-8 text-center">
        <Link
          href="/focus-group/feedback"
          className="text-[#C9A66B] hover:text-[#E7C686] transition-colors text-sm underline"
        >
          ← Submit weekly feedback
        </Link>
      </div>
    </div>
  );
}
