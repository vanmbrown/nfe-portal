'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import INCILists from '@/components/education/INCILists';
import ActivesDataTable from '@/components/nfe/ActivesDataTable';
import IngredientGlossary from '@/components/education/IngredientGlossary';

type Tab = 'inci' | 'actives' | 'glossary';

export default function INCIPage() {
  const [activeTab, setActiveTab] = useState<Tab>('inci');

  const tabs = [
    { id: 'inci' as Tab, label: 'INCI List' },
    { id: 'actives' as Tab, label: 'Actives Data Table' },
    { id: 'glossary' as Tab, label: 'Ingredient Glossary' },
  ];

  return (
    <main id="inci-panel" className="min-h-screen w-full bg-[#F6F5F3]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-primary font-bold text-[#0E2A22] mb-8">
          NFE Ingredient Transparency
        </h1>

        {/* Tab Navigation */}
        <div className="border-b border-[#C9A66B] mb-6">
          <nav className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#0E2A22] border-b-2 border-[#C9A66B]'
                    : 'text-gray-600 hover:text-[#0E2A22]'
                }`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'inci' && <INCILists />}
          {activeTab === 'actives' && <ActivesDataTable />}
          {activeTab === 'glossary' && <IngredientGlossary />}
        </motion.div>
      </div>
    </main>
  );
}


