'use client';

import React from 'react';
import EducationNavTabs from '@/components/navigation/EducationNavTabs';

export default function EducationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="education-layout min-h-screen w-full">
      <EducationNavTabs />
      {children}
    </div>
  );
}








