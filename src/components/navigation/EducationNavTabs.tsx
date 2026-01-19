'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

type Tab = 'science' | 'inci';

const tabs: { id: Tab; label: string; href: string }[] = [
  { id: 'science', label: 'Science', href: '/science' },
  { id: 'inci', label: 'Ingredients', href: '/inci' },
];

export default function EducationNavTabs() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Determine active tab based on current pathname
  const activeTab = pathname === '/science' ? 'science' : pathname === '/inci' ? 'inci' : null;

  const handleTabClick = (href: string) => {
    router.push(href);
  };

  return (
    <div className="w-full border-b border-[#C9A66B]/30 bg-gradient-to-br from-[#0B291E] via-[#0E2A22] to-[#0B291E]">
      <div className="container mx-auto px-4 overflow-x-auto">
        <div
          className="flex gap-1 overflow-x-auto whitespace-nowrap overscroll-x-contain [-webkit-overflow-scrolling:touch] min-w-max"
          role="tablist"
          aria-label="Education navigation"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.href)}
                role="tab"
                aria-selected={isActive}
                aria-controls={tab.id === 'science' ? 'science-panel' : 'inci-panel'}
                className={`flex-none px-6 py-4 font-medium text-sm transition-colors relative ${
                  isActive
                    ? 'text-[#E7C686]'
                    : 'text-[#D5D2C7] hover:text-[#FDFCF8]'
                }`}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E7C686]"
                    layoutId="activeTab"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}








