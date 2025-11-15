'use client';

import React from 'react';
import { useScience } from '@/context/ScienceContext';
import { CategoryFilter } from '@/types/actives';
import { motion } from 'framer-motion';

const CATEGORIES: CategoryFilter[] = ['Tone', 'Hydration', 'Antioxidants', 'Peptides'];

const CATEGORY_COLORS: Record<CategoryFilter, string> = {
  'Tone': '#36C270',
  'Hydration': '#4CB3FF',
  'Antioxidants': '#D94BBA',
  'Peptides': '#F8D775',
};

const CATEGORY_TEXT_COLORS: Record<CategoryFilter, string> = {
  'Tone': '#ffffff',
  'Hydration': '#000000',
  'Antioxidants': '#ffffff',
  'Peptides': '#000000',
};

export default function ActiveCategoriesPanel() {
  const { selectedCategories, toggleCategory } = useScience();

  return (
    <div className="mb-6">
      <h3 className="text-[#E7C686] text-lg font-semibold mb-3 mt-8 uppercase tracking-[0.05em]">
        Filter by Category
      </h3>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategories.includes(category);
          const bgColor = isSelected ? '#E7C686' : 'rgba(231, 198, 134, 0.05)';
          const textColor = isSelected ? '#0E2A22' : '#FDFCF8';
          const borderColor = '#E7C686';

          return (
            <motion.button
              key={category}
              onClick={() => toggleCategory(category)}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-all border ${
                isSelected ? 'font-semibold shadow-md' : 'hover:bg-[rgba(231,198,134,0.1)]'
              }`}
              style={{
                backgroundColor: bgColor,
                color: textColor,
                borderColor: borderColor,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-pressed={isSelected}
              aria-label={`Filter by ${category}`}
            >
              {category}
            </motion.button>
          );
        })}
      </div>
      {selectedCategories.length > 0 && (
        <button
          onClick={() => {
            selectedCategories.forEach((cat) => toggleCategory(cat));
          }}
          className="mt-3 text-sm text-[#D5D2C7] hover:text-[#E7C686] underline transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}


