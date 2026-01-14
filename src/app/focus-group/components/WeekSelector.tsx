'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface WeekSelectorProps {
  currentWeek: number;
  basePath: string; // e.g., '/focus-group/feedback' or '/focus-group/upload'
  maxWeeks?: number;
}

export default function WeekSelector({ 
  currentWeek, 
  basePath, 
  maxWeeks = 4 
}: WeekSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleWeekChange = (week: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('week', week.toString());
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap mr-2">
        Select Week:
      </span>
      <div className="flex space-x-2">
        {Array.from({ length: maxWeeks }, (_, i) => i + 1).map((week) => {
          const isActive = week === currentWeek;
          return (
            <button
              key={week}
              onClick={() => handleWeekChange(week)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                isActive
                  ? "bg-[#0E2A22] text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-[#C9A66B] hover:text-[#0E2A22]"
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              Week {week}
            </button>
          );
        })}
      </div>
    </div>
  );
}



