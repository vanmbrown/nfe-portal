import React from 'react';
import { cn } from '@/lib/utils';
import { Info, Check, AlertCircle, XCircle, X } from './Icon';

export interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  'aria-label'?: string;
}

const variantClasses = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  error: 'bg-red-50 border-red-200 text-red-800',
};

const sizeClasses = {
  sm: 'p-3 text-sm',
  md: 'p-4 text-base',
  lg: 'p-6 text-lg',
};

const iconMap = {
  info: Info,
  success: Check,
  warning: AlertCircle,
  error: XCircle,
};

export function Alert({
  children,
  variant = 'info',
  size = 'md',
  dismissible = false,
  onDismiss,
  className = '',
  'aria-label': ariaLabel,
  ...props
}: AlertProps) {
  const IconComponent = iconMap[variant];

  return (
    <div
      className={cn(
        'rounded-lg border flex items-start gap-3',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      role="alert"
      aria-label={ariaLabel}
      {...props}
    >
      <IconComponent
        size="sm"
        className="mt-0.5 flex-shrink-0"
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        {children}
      </div>
      {dismissible && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-black/10 transition-colors"
          aria-label="Dismiss alert"
        >
          <X size="sm" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

// Alert subcomponents for consistent structure
export function AlertTitle({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h4 className={cn('font-semibold mb-1', className)}>
      {children}
    </h4>
  );
}

export function AlertDescription({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn('text-sm opacity-90', className)}>
      {children}
    </p>
  );
}

// Pre-configured alert variants
export function InfoAlert({
  title,
  description,
  dismissible = false,
  onDismiss,
  className = '',
}: {
  title?: string;
  description: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}) {
  return (
    <Alert
      variant="info"
      dismissible={dismissible}
      onDismiss={onDismiss}
      className={className}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}

export function SuccessAlert({
  title,
  description,
  dismissible = false,
  onDismiss,
  className = '',
}: {
  title?: string;
  description: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}) {
  return (
    <Alert
      variant="success"
      dismissible={dismissible}
      onDismiss={onDismiss}
      className={className}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}

export function WarningAlert({
  title,
  description,
  dismissible = false,
  onDismiss,
  className = '',
}: {
  title?: string;
  description: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}) {
  return (
    <Alert
      variant="warning"
      dismissible={dismissible}
      onDismiss={onDismiss}
      className={className}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}

export function ErrorAlert({
  title,
  description,
  dismissible = false,
  onDismiss,
  className = '',
}: {
  title?: string;
  description: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}) {
  return (
    <Alert
      variant="error"
      dismissible={dismissible}
      onDismiss={onDismiss}
      className={className}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}

// Toast-style alerts for temporary notifications
export function ToastAlert({
  message,
  variant = 'info',
  onDismiss,
  className = '',
}: {
  message: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  onDismiss?: () => void;
  className?: string;
}) {
  return (
    <Alert
      variant={variant}
      size="sm"
      dismissible
      onDismiss={onDismiss}
      className={cn('shadow-lg', className)}
    >
      {message}
    </Alert>
  );
}

// Form validation alerts
export function ValidationAlert({
  errors,
  className = '',
}: {
  errors: string[];
  className?: string;
}) {
  if (errors.length === 0) return null;

  return (
    <Alert
      variant="error"
      size="sm"
      className={className}
    >
      <AlertTitle>Please fix the following errors:</AlertTitle>
      <ul className="mt-2 space-y-1">
        {errors.map((error, index) => (
          <li key={index} className="text-sm">
            • {error}
          </li>
        ))}
      </ul>
    </Alert>
  );
}
