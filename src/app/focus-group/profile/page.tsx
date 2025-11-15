'use client';

import React from 'react';
import ProfileForm from '@/components/focus-group/ProfileForm';

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-primary font-bold text-[#0E2A22] mb-6">
        Complete Your Profile
      </h1>
      <p className="text-gray-600 mb-8">
        Please provide some information about yourself to help us personalize your experience.
      </p>
      <ProfileForm />
    </div>
  );
}








