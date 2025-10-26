import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps {
  value?: number; // 0-100 for determinate, undefined for indeterminate
  max?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const variantClasses = {
  default: 'bg-nfe-green',
  success: 'bg-green-600',
  warning: 'bg-yellow-600',
  error: 'bg-red-600',
};

export function Progress({
  value,
  max = 100,
  className,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: ProgressProps) {
  const isIndeterminate = value === undefined;
  const percentage = isIndeterminate ? 0 : Math.min(Math.max((value / max) * 100, 0), 100);
  const displayLabel = label || (showLabel && !isIndeterminate ? `${Math.round(percentage)}%` : undefined);

  return (
    <div className={cn('w-full', className)}>
      {displayLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-nfe-ink">{displayLabel}</span>
          {showLabel && !isIndeterminate && (
            <span className="text-sm text-nfe-muted">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      
      <div
        className={cn(
          'w-full bg-gray-200 rounded-full overflow-hidden',
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-in-out',
            variantClasses[variant],
            isIndeterminate && 'animate-indeterminate'
          )}
          style={{
            width: isIndeterminate ? '30%' : `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

// Indeterminate animation styles should be added to globals.scss:
/*
@keyframes indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(400%);
  }
}

.animate-indeterminate {
  animation: indeterminate 1.5s ease-in-out infinite;
}
*/

