'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

const placementClasses = {
  top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
};

const arrowClasses = {
  top: 'top-full left-1/2 transform -translate-x-1/2 border-t-nfe-ink',
  bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-nfe-ink',
  left: 'left-full top-1/2 transform -translate-y-1/2 border-l-nfe-ink',
  right: 'right-full top-1/2 transform -translate-y-1/2 border-r-nfe-ink',
};

export function Tooltip({
  children,
  content,
  placement = 'top',
  delay = 200,
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    if (disabled) return;
    
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        let top = 0;
        let left = 0;
        
        switch (placement) {
          case 'top':
            top = rect.top + scrollTop - 8;
            left = rect.left + rect.width / 2;
            break;
          case 'bottom':
            top = rect.bottom + scrollTop + 8;
            left = rect.left + rect.width / 2;
            break;
          case 'left':
            top = rect.top + scrollTop + rect.height / 2;
            left = rect.left + scrollLeft - 8;
            break;
          case 'right':
            top = rect.top + scrollTop + rect.height / 2;
            left = rect.right + scrollLeft + 8;
            break;
        }
        
        setPosition({ top, left });
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      hideTooltip();
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const tooltipContent = isVisible && (
    <div
      ref={tooltipRef}
      className={cn(
        'absolute z-50 px-3 py-2 text-sm text-nfe-paper bg-nfe-ink rounded-md shadow-lg',
        'max-w-xs break-words',
        placementClasses[placement],
        className
      )}
      style={{
        top: position.top,
        left: position.left,
      }}
      role="tooltip"
      aria-hidden="false"
    >
      {content}
      <div
        className={cn(
          'absolute w-0 h-0 border-4 border-transparent',
          arrowClasses[placement]
        )}
      />
    </div>
  );

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      role="button"
      tabIndex={0}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      aria-describedby={isVisible ? 'tooltip' : undefined}
    >
      {children}
      {typeof window !== 'undefined' && createPortal(tooltipContent, document.body)}
    </div>
  );
}

// Pre-configured tooltip variants
export function InfoTooltip({
  children,
  info,
  className = '',
}: {
  children: React.ReactNode;
  info: string;
  className?: string;
}) {
  return (
    <Tooltip
      content={info}
      placement="top"
      className={className}
    >
      {children}
    </Tooltip>
  );
}

export function HelpTooltip({
  children,
  help,
  className = '',
}: {
  children: React.ReactNode;
  help: string;
  className?: string;
}) {
  return (
    <Tooltip
      content={
        <div className="text-sm">
          <div className="font-medium mb-1">Help</div>
          <div>{help}</div>
        </div>
      }
      placement="top"
      delay={100}
      className={className}
    >
      {children}
    </Tooltip>
  );
}

export function IngredientTooltip({
  children,
  ingredient,
  className = '',
}: {
  children: React.ReactNode;
  ingredient: {
    name: string;
    benefits: string[];
    safety: 'safe' | 'caution' | 'avoid';
  };
  className?: string;
}) {
  const safetyColors = {
    safe: 'text-green-400',
    caution: 'text-yellow-400',
    avoid: 'text-red-400',
  };

  return (
    <Tooltip
      content={
        <div className="text-sm max-w-xs">
          <div className="font-medium mb-2">{ingredient.name}</div>
          <div className="mb-2">
            <div className="font-medium text-xs mb-1">Benefits:</div>
            <ul className="text-xs space-y-1">
              {ingredient.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-1">•</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs">Safety:</span>
            <span className={`text-xs font-medium ${safetyColors[ingredient.safety]}`}>
              {ingredient.safety}
            </span>
          </div>
        </div>
      }
      placement="top"
      className={className}
    >
      {children}
    </Tooltip>
  );
}

export function KeyboardTooltip({
  children,
  shortcut,
  className = '',
}: {
  children: React.ReactNode;
  shortcut: string;
  className?: string;
}) {
  return (
    <Tooltip
      content={
        <div className="text-sm">
          <div className="font-medium mb-1">Keyboard Shortcut</div>
          <kbd className="px-2 py-1 bg-gray-700 text-gray-200 rounded text-xs font-mono">
            {shortcut}
          </kbd>
        </div>
      }
      placement="top"
      className={className}
    >
      {children}
    </Tooltip>
  );
}
