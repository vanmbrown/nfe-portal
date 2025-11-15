'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sanitizeHTML } from '@/lib/utils/sanitize';

type TabName = 'details' | 'benefits' | 'usage' | 'ingredients';

interface ProductTabsProps {
  details: string; // HTML string
  benefits: string[];
  usage: string; // HTML string
  ingredients: string; // HTML string
}

export function ProductTabs({ details, benefits, usage, ingredients }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabName>('details');

  const tabs: { id: TabName; label: string }[] = [
    { id: 'details', label: 'Details' },
    { id: 'benefits', label: 'Benefits' },
    { id: 'usage', label: 'Usage' },
    { id: 'ingredients', label: 'Ingredients' },
  ];

  const getTabContent = () => {
    switch (activeTab) {
      case 'details':
        return details;
      case 'benefits':
        return `<ul class="space-y-3">${benefits.map(b => `<li class="flex items-start"><span class="text-[#D4AF37] mr-3">•</span><span>${b}</span></li>`).join('')}</ul>`;
      case 'usage':
        return usage;
      case 'ingredients':
        return ingredients;
      default:
        return details;
    }
  };

  return (
    <section className="w-full bg-white py-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Tab Navigation */}
        <div className="flex justify-center border-b border-[#E5E5E5] mb-8">
          <ul className="flex space-x-6 text-sm font-medium">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    pb-4 px-2 border-b-2 transition-colors duration-200
                    ${
                      activeTab === tab.id
                        ? 'border-[#D4AF37] text-[#0F2C1C] font-semibold'
                        : 'border-transparent text-[#2B2B2B]/60 hover:text-[#0F2C1C] hover:border-[#D4AF37]/30'
                    }
                    focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 rounded-sm
                  `}
                  aria-selected={activeTab === tab.id}
                  role="tab"
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="prose prose-lg max-w-none
                prose-headings:font-serif prose-headings:text-[#0F2C1C]
                prose-p:text-[#2B2B2B] prose-p:leading-relaxed prose-p:mb-6
                prose-strong:text-[#0F2C1C] prose-strong:font-semibold
                prose-ul:text-[#2B2B2B] prose-ul:my-6
                prose-li:text-[#2B2B2B] prose-li:leading-relaxed
                prose-a:text-[#0F2C1C] prose-a:underline prose-a:decoration-[#D4AF37] prose-a:underline-offset-2
                prose-a:hover:text-[#2A4C44]
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:font-serif"
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(getTabContent()) }}
            />
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}








