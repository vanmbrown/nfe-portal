'use client';

import React from 'react';
import type { Database } from '@/types/supabase';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface SummaryProps {
  profile: ProfileRow;
}

export default function Summary({ profile }: SummaryProps) {
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return 'Not provided';
    }
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : 'None';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value);
  };

  const sections = [
    {
      title: 'Personal Information',
      fields: [
        { label: 'Age Range', value: profile.age_range },
        { label: 'Gender Identity', value: profile.gender_identity },
        { label: 'Ethnic Background', value: profile.ethnic_background },
        { label: 'Fitzpatrick Skin Tone', value: profile.fitzpatrick_skin_tone },
        { label: 'Skin Type', value: profile.skin_type },
      ],
    },
    {
      title: 'Skin Concerns',
      fields: [
        { label: 'Top Concerns', value: profile.top_concerns },
        { label: 'Lifestyle Factors', value: profile.lifestyle },
      ],
    },
    {
      title: 'Environment & Lifestyle',
      fields: [
        { label: 'Climate Exposure', value: profile.climate_exposure },
        { label: 'UV Exposure', value: profile.uv_exposure },
        { label: 'Sleep Quality', value: profile.sleep_quality },
        { label: 'Stress Level', value: profile.stress_level },
      ],
    },
    {
      title: 'Routine & Products',
      fields: [
        { label: 'Current Routine', value: profile.current_routine },
        { label: 'Routine Frequency', value: profile.routine_frequency },
        { label: 'Known Sensitivities', value: profile.known_sensitivities },
        { label: 'Product Use History', value: profile.product_use_history },
        { label: 'Ideal Routine', value: profile.ideal_routine },
        { label: 'Ideal Product', value: profile.ideal_product },
      ],
    },
    {
      title: 'Financial Commitment',
      fields: [
        { label: 'Average Spend per Item', value: profile.avg_spend_per_item ? `$${profile.avg_spend_per_item}` : null },
        { label: 'Annual Skincare Spend', value: profile.annual_skincare_spend ? `$${profile.annual_skincare_spend}` : null },
        { label: 'Max Spend Motivation', value: profile.max_spend_motivation },
        { label: 'Value Stickiness', value: profile.value_stickiness },
      ],
    },
    {
      title: 'Consent',
      fields: [
        { label: 'Image Consent', value: profile.image_consent },
        { label: 'Marketing Consent', value: profile.marketing_consent },
        { label: 'Data Use Consent', value: profile.data_use_consent },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {sections.map((section, sectionIndex) => {
        const visibleFields = section.fields.filter((field) => field.value !== null && field.value !== undefined && field.value !== '');
        
        if (visibleFields.length === 0) {
          return null;
        }

        return (
          <div key={sectionIndex} className="border-b border-gray-200 pb-4 last:border-b-0">
            <h3 className="text-lg font-semibold text-[#0E2A22] mb-3">{section.title}</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleFields.map((field, fieldIndex) => (
                <div key={fieldIndex}>
                  <dt className="text-sm font-medium text-gray-600 mb-1">{field.label}</dt>
                  <dd className="text-sm text-gray-900">{formatValue(field.value)}</dd>
                </div>
              ))}
            </dl>
          </div>
        );
      })}
    </div>
  );
}







