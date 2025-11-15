import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'featured' | 'bordered' | 'elevated' | 'outline';
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const variantClasses = {
  default: 'bg-nfe-paper border border-gray-200',
  featured: 'bg-gradient-to-br from-nfe-green-50 to-nfe-gold-50 border-2 border-nfe-gold',
  bordered: 'bg-nfe-paper border-2 border-nfe-green',
  elevated: 'bg-nfe-paper border border-gray-200 shadow-lg',
  outline: 'bg-transparent border border-nfe-green',
};

const paddingClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  hover = false,
  onClick,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}: CardProps) {
  const isInteractive = !!onClick;

  return (
    <div
      className={cn(
        'rounded-lg transition-all duration-200',
        variantClasses[variant],
        paddingClasses[padding],
        hover && 'hover:shadow-md hover:-translate-y-1',
        isInteractive && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-nfe-gold focus:ring-offset-2',
        className
      )}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      onKeyDown={isInteractive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

// Card subcomponents for consistent structure
export function CardHeader({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = '',
  as: Component = 'h3',
}: {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}) {
  return (
    <Component className={cn('text-lg font-semibold text-nfe-ink', className)}>
      {children}
    </Component>
  );
}

export function CardDescription({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn('text-sm text-nfe-muted', className)}>
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-gray-200', className)}>
      {children}
    </div>
  );
}

// Pre-configured card variants
export function ProductCard({
  title,
  description,
  price,
  image,
  onClick,
  className = '',
}: {
  title: string;
  description: string;
  price: string;
  image: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Card
      variant="default"
      hover
      onClick={onClick}
      className={className}
      aria-label={`View ${title} product details`}
    >
      <CardHeader>
        <div className="relative w-full h-48 mb-4">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover rounded-md"
            unoptimized
          />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-nfe-green">{price}</span>
          <Button variant="primary" size="sm">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ArticleCard({
  title,
  description,
  author,
  date,
  image,
  href,
  className = '',
}: {
  title: string;
  description: string;
  author: string;
  date: string;
  image: string;
  href: string;
  className?: string;
}) {
  return (
    <Card
      variant="default"
      hover
      className={className}
      onClick={() => window.open(href, '_blank')}
      aria-label={`Read article: ${title}`}
    >
      <CardHeader>
        <div className="relative w-full h-48 mb-4">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover rounded-md"
            unoptimized
          />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <div className="flex justify-between items-center text-sm text-nfe-muted">
          <span>By {author}</span>
          <time dateTime={date}>{new Date(date).toLocaleDateString()}</time>
        </div>
      </CardFooter>
    </Card>
  );
}
