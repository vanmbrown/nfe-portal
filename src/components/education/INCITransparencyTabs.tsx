'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import INCILists from '@/components/education/INCILists'
import ActivesDataTable from '@/components/nfe/ActivesDataTable'
import IngredientGlossary from '@/components/education/IngredientGlossary'

type Tab = 'inci' | 'actives' | 'glossary'

/**
 * The existing INCI / actives / glossary tabs, moved verbatim out of the route
 * file so the page itself can be server-rendered.
 *
 * Nothing about this behaviour changed. It was extracted because the ingredient
 * family sections above it are anchor destinations, and an anchor cannot
 * resolve into a client-rendered tab panel that starts hidden.
 */
export default function INCITransparencyTabs() {
  const [activeTab, setActiveTab] = useState<Tab>('inci')

  const tabs = [
    { id: 'inci' as Tab, label: 'INCI List' },
    { id: 'actives' as Tab, label: 'Actives Data Table' },
    { id: 'glossary' as Tab, label: 'Ingredient Glossary' },
  ]

  return (
    <>
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
    </>
  )
}
