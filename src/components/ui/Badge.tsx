import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
  onClick?: () => void;
}

const variantClasses = {
  default: 'bg-nfe-muted text-nfe-paper',
  success: 'bg-green-100 text-green-800 border border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  error: 'bg-red-100 text-red-800 border border-red-200',
  info: 'bg-blue-100 text-blue-800 border border-blue-200',
  outline: 'bg-transparent text-nfe-ink border border-nfe-muted',
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

export function Badge({
  children,
  variant = 'default',
  style,
  size = 'md',
  className = '',
  'aria-label': ariaLabel,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      style={style}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </span>
  );
}

// Pre-configured badge variants for common use cases
export function StatusBadge({
  status,
  className = '',
}: {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'error';
  className?: string;
}) {
  const statusConfig = {
    active: { variant: 'success' as const, children: 'Active' },
    inactive: { variant: 'default' as const, children: 'Inactive' },
    pending: { variant: 'warning' as const, children: 'Pending' },
    completed: { variant: 'success' as const, children: 'Completed' },
    error: { variant: 'error' as const, children: 'Error' },
  };

  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={className}
      aria-label={`Status: ${config.children}`}
    >
      {config.children}
    </Badge>
  );
}

export function CategoryBadge({
  category,
  className = '',
}: {
  category: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      size="sm"
      className={className}
      aria-label={`Category: ${category}`}
    >
      {category}
    </Badge>
  );
}

export function IngredientBadge({
  ingredient,
  safety,
  className = '',
}: {
  ingredient: string;
  safety: 'safe' | 'caution' | 'avoid';
  className?: string;
}) {
  const safetyConfig = {
    safe: { variant: 'success' as const },
    caution: { variant: 'warning' as const },
    avoid: { variant: 'error' as const },
  };

  const config = safetyConfig[safety];

  return (
    <Badge
      variant={config.variant}
      size="sm"
      className={className}
      aria-label={`Ingredient: ${ingredient}, Safety: ${safety}`}
    >
      {ingredient}
    </Badge>
  );
}

export function TagBadge({
  tag,
  onClick,
  className = '',
}: {
  tag: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      size="sm"
      className={cn(
        onClick && 'cursor-pointer hover:bg-nfe-green hover:text-nfe-paper transition-colors',
        className
      )}
      onClick={onClick}
      aria-label={`Tag: ${tag}${onClick ? ', click to filter' : ''}`}
    >
      {tag}
    </Badge>
  );
}

export function NotificationBadge({
  count,
  max = 99,
  className = '',
}: {
  count: number;
  max?: number;
  className?: string;
}) {
  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <Badge
      variant="error"
      size="sm"
      className={cn(
        'absolute -top-2 -right-2 min-w-[1.5rem] h-6 flex items-center justify-center',
        className
      )}
      aria-label={`${count} notifications`}
    >
      {displayCount}
    </Badge>
  );
}
