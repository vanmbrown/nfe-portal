import React from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps {
  value: number[];
  min: number;
  max: number;
  step: number;
  onValueChange: (value: number[]) => void;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export function Slider({
  value,
  min,
  max,
  step,
  onValueChange,
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: SliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange([Number(e.target.value)]);
  };

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={handleChange}
      aria-label={ariaLabel || `Slider from ${min} to ${max}`}
      aria-describedby={ariaDescribedBy}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value[0]}
      className={cn(
        'w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer',
        'focus:outline-none focus:ring-2 focus:ring-nfe-gold focus:ring-offset-2',
        '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-nfe-green [&::-webkit-slider-thumb]:cursor-pointer',
        '[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-nfe-green [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0',
        className
      )}
    />
  );
}

