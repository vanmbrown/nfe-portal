'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFocusGroup } from '../context/FocusGroupContext';
import WeekSelector from '../components/WeekSelector';
import { useUploads } from './hooks/useUploads';
import UploadPanel from './components/UploadPanel';
import { Button } from '@/components/ui/Button';

export default function UploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentWeek } = useFocusGroup();
  const { uploads, isLoading, listUploads, uploadFiles, error } = useUploads();
  const [week, setWeek] = useState<number>(1);

  // Determine week from query string or context
  useEffect(() => {
    const weekParam = searchParams.get('week');
    if (weekParam) {
      const weekNum = parseInt(weekParam, 10);
      if (!isNaN(weekNum) && weekNum > 0) {
        setWeek(weekNum);
      }
    } else if (currentWeek) {
      setWeek(currentWeek);
    }
  }, [searchParams, currentWeek]);

  // Load existing uploads for the week
  useEffect(() => {
    if (week > 0) {
      listUploads(week);
    }
  }, [week, listUploads]);

  // Handle file upload
  const handleUpload = async (files: File[]) => {
    await uploadFiles(files, week);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-primary font-bold text-[#0E2A22] mb-2">
          Upload Week {week} Photos
        </h1>
        <p className="text-gray-600">
          Upload photos showing your progress. We recommend taking photos from the front, left,
          and right angles for best tracking.
        </p>
      </div>

      {/* Week Selector */}
      <WeekSelector currentWeek={week} basePath="/focus-group/upload" />

      {/* Upload Panel */}
      <UploadPanel
        week={week}
        onUpload={handleUpload}
        existingUploads={uploads}
        isLoading={isLoading}
        error={error}
      />

      {/* Navigation Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => router.push(`/focus-group/feedback?week=${week}`)}
          variant="outline"
          className="flex-1"
        >
          Back to Week {week} Feedback
        </Button>
        <Button
          onClick={() => router.push('/focus-group/profile/summary')}
          variant="outline"
          className="flex-1"
        >
          Back to Summary
        </Button>
      </div>
    </div>
  );
}
