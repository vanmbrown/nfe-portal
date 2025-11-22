'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sanitizeHTML } from '@/lib/utils/sanitize';

interface ProductAccordionProps {
  details: string; // HTML string
  benefits: string[];
  usage: string; // HTML string
  ingredients: string; // HTML string
  textureScentExperience?: string; // HTML string - optional, will be combined with details
  faq?: Array<{ q: string; a: string }>; // FAQ items - optional
  faqContent?: React.ReactNode; // Custom FAQ markup - optional
}

type AccordionSection = 'details' | 'benefits' | 'usage' | 'ingredients' | 'faq';

type SectionContent = string | React.ReactNode;

export function ProductAccordion({
  details,
  benefits,
  usage,
  ingredients,
  textureScentExperience,
  faq,
  faqContent,
}: ProductAccordionProps) {
  const [openSection, setOpenSection] = useState<AccordionSection | null>(null);

  const toggleSection = (section: AccordionSection) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  // Format texture/scent/experience: convert h3 tags to bold labels with proper spacing
  const formatTextureScentExperience = (html: string): string => {
    // Replace h3 tags followed by p tags with p tags containing bold labels
    return html
      .replace(/<h3>Texture<\/h3>\s*<p>/gi, '<p><strong>Texture</strong><br />')
      .replace(/<h3>Scent<\/h3>\s*<p>/gi, '<p><strong>Scent</strong><br />')
      .replace(/<h3>Experience<\/h3>\s*<p>/gi, '<p><strong>Experience</strong><br />');
  };

  // Combine details with formatted texture/scent/experience if provided
  const detailsContent = textureScentExperience 
    ? `${details}${formatTextureScentExperience(textureScentExperience)}` 
    : details;

  // Format FAQ as HTML
  const formatFAQ = (faqItems?: Array<{ q: string; a: string }>): string => {
    if (!faqItems || faqItems.length === 0) return '';
    
    const faqHTML = faqItems.map(item => `
      <details class="border border-neutral-300 rounded-xl p-4 md:p-6 hover:border-[#D4AF37]/50 transition-colors group mb-4">
        <summary class="font-serif text-lg md:text-xl cursor-pointer list-none flex justify-between items-center min-h-[44px]">
          <span class="pr-4">${item.q}</span>
          <span class="text-[#D4AF37] text-xl font-light flex-shrink-0 group-open:hidden">+</span>
          <span class="text-[#D4AF37] text-xl font-light flex-shrink-0 hidden group-open:inline">−</span>
        </summary>
        <p class="mt-4 text-sm md:text-base leading-relaxed text-[#0F2C1C]">
          ${item.a}
        </p>
      </details>
    `).join('');
    
    return `<div class="space-y-4">${faqHTML}</div>`;
  };

  const sections: {
    id: AccordionSection;
    title: string;
    content: SectionContent;
  }[] = [
    {
      id: 'details',
      title: 'Details',
      content: detailsContent,
    },
    {
      id: 'benefits',
      title: 'Benefits',
      content: `<ul class="space-y-2">${benefits.map(b => `<li class="flex items-start"><span class="text-[#D4AF37] mr-3">•</span><span>${b}</span></li>`).join('')}</ul>`,
    },
    {
      id: 'usage',
      title: 'Usage',
      content: usage,
    },
    {
      id: 'ingredients',
      title: 'Ingredients',
      content: ingredients,
    },
    ...((faqContent || (faq && faq.length > 0))
      ? [{
          id: 'faq' as AccordionSection,
          title: 'FAQ — The Face Elixir',
          content: faqContent ?? formatFAQ(faq),
        }]
      : []),
  ];

  return (
    <section className="bg-[#FAF9F6] text-[#0F2C1C] py-16 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        {sections.map((section) => {
          const isOpen = openSection === section.id;

          return (
            <div
              key={section.id}
              className="border-b border-neutral-300 last:border-b-0"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className={`
                  flex justify-between items-center w-full py-4 text-left
                  font-serif text-lg md:text-xl
                  transition-colors duration-200
                  hover:text-[#D4AF37]
                  focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-[#FAF9F6] rounded-sm
                  ${isOpen ? 'text-[#D4AF37]' : 'text-[#0F2C1C]'}
                `}
                aria-expanded={isOpen}
                aria-controls={`accordion-content-${section.id}`}
              >
                <span>{section.title}</span>
                <span className="ml-4 text-xl font-light">
                  {isOpen ? '−' : '+'}
                </span>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    key={`accordion-content-${section.id}`}
                    id={`accordion-content-${section.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div
                      className={`pb-4 prose prose-sm max-w-none
                        prose-headings:font-serif prose-headings:text-[#0F2C1C]
                        prose-p:text-[#0F2C1C] prose-p:leading-relaxed ${section.id === 'details' ? 'prose-p:mb-4 space-y-4' : 'prose-p:mb-4'}
                        prose-strong:text-[#0F2C1C] prose-strong:font-semibold
                        prose-ul:text-[#0F2C1C] prose-ul:my-4
                        prose-li:text-[#0F2C1C] prose-li:leading-relaxed
                        prose-a:text-[#0F2C1C] prose-a:underline prose-a:decoration-[#D4AF37] prose-a:underline-offset-2
                        prose-a:hover:text-[#2A4C44]
                        prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-h3:font-serif
                        [&_.space-y-2]:space-y-2 [&_.space-y-4]:space-y-4
                        [&_li.flex]:flex [&_li.items-start]:items-start
                        [&_span.text-\\[\\#D4AF37\\]]:text-[#D4AF37] [&_span.mr-3]:mr-3
                        [&_details]:border [&_details]:border-neutral-300 [&_details]:rounded-xl [&_details]:p-4 [&_details]:md:p-6
                        [&_details]:hover:border-[\\#D4AF37]/50 [&_details]:transition-colors [&_details]:group [&_details]:mb-4`}
                    >
                      {typeof section.content === 'string' ? (
                        <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(section.content) }} />
                      ) : (
                        section.content
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}

