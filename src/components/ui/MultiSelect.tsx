'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Badge } from './Badge';

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  options: MultiSelectOption[] | string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  disabled?: boolean;
  maxDisplay?: number;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Select options...',
  className = '',
  label,
  disabled = false,
  maxDisplay = 3,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Normalize options to always be objects
  const normalizedOptions: MultiSelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const toggleOption = (optionValue: string) => {
    if (disabled) return;
    
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const removeOption = (optionValue: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (disabled) return;
    onChange(value.filter((v) => v !== optionValue));
  };

  const selectedOptions = normalizedOptions.filter((opt) =>
    value.includes(opt.value)
  );

  const displayCount = selectedOptions.length;
  const displayOptions = selectedOptions.slice(0, maxDisplay);
  const remainingCount = displayCount - maxDisplay;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block mb-2 text-base md:text-lg font-semibold text-[#0E2A22] tracking-tight">
          {label}
        </label>
      )}
      <div ref={containerRef} className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) {
              setIsOpen(!isOpen);
            }
          }}
          disabled={disabled}
          className={cn(
            'w-full rounded-md border border-[#C9A66B] bg-white px-3 py-2 text-sm md:text-base text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]',
            'flex items-center justify-between min-h-[42px]',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={label || 'Multi-select'}
        >
          <div className="flex flex-wrap gap-1 flex-1 items-center">
            {displayCount === 0 ? (
              <span className="text-gray-500">{placeholder}</span>
            ) : (
              <>
                {displayOptions.map((opt) => (
                  <Badge
                    key={opt.value}
                    variant="outline"
                    className="mr-1 mb-1 flex items-center gap-1 bg-[#C9A66B]/10 border-[#C9A66B] text-[#0E2A22]"
                  >
                    <span className="text-xs">{opt.label}</span>
                    {!disabled && (
                      <button
                        type="button"
                        onClick={(e) => removeOption(opt.value, e)}
                        className="ml-1 hover:bg-[#C9A66B]/20 rounded-full p-0.5"
                        aria-label={`Remove ${opt.label}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
                {remainingCount > 0 && (
                  <Badge
                    variant="outline"
                    className="mr-1 mb-1 bg-[#C9A66B]/10 border-[#C9A66B] text-[#0E2A22]"
                  >
                    +{remainingCount} more
                  </Badge>
                )}
              </>
            )}
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-gray-500 transition-transform',
              isOpen && 'transform rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <div
            className="absolute z-50 w-full mt-1 bg-white border border-[#C9A66B] rounded-md shadow-lg max-h-60 overflow-auto"
            role="listbox"
            aria-label={label || 'Options'}
          >
            {normalizedOptions.map((option) => {
              const isSelected = value.includes(option.value);
              return (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(option.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleOption(option.value);
                    }
                  }}
                  className={cn(
                    'px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-[#C9A66B]/10 transition-colors',
                    isSelected && 'bg-[#C9A66B]/5'
                  )}
                  tabIndex={0}
                >
                  <span className="text-sm text-gray-900">{option.label}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-[#C9A66B]" />
                  )}
                </div>
              );
            })}
            {normalizedOptions.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                No options available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}








