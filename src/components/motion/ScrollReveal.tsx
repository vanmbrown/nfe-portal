'use client';

import React from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { revealVariants, getMotionVariants } from '@/lib/motion/variants';

export interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  className?: string;
  'data-testid'?: string;
}

export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  className = '',
  'data-testid': dataTestId,
}: ScrollRevealProps) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const prefersReducedMotion = useReducedMotion() ?? false;

  const getDirectionVariants = () => {
    const baseVariants = {
      hidden: {
        opacity: 0,
        y: direction === 'up' ? 30 : direction === 'down' ? -30 : 0,
        x: direction === 'left' ? 30 : direction === 'right' ? -30 : 0,
      },
      visible: {
        opacity: 1,
        y: 0,
        x: 0,
        transition: {
          duration,
          delay,
          ease: 'easeOut',
        },
      },
    };

    return getMotionVariants(baseVariants, prefersReducedMotion);
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={getDirectionVariants()}
      className={className}
      data-testid={dataTestId}
    >
      {children}
    </motion.div>
  );
}
