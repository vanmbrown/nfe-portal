'use client';

import React, { useEffect, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { fadeInVariants, getMotionVariants } from '@/lib/motion/variants';

export interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  'data-testid'?: string;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.6,
  className = '',
  'data-testid': dataTestId,
}: FadeInProps) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const prefersReducedMotion = useReducedMotion() ?? false;

  const variants = getMotionVariants(
    {
      ...fadeInVariants,
      visible: {
        ...fadeInVariants.visible,
        transition: {
          duration,
          delay,
        },
      },
    },
    prefersReducedMotion
  );

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      className={className}
      data-testid={dataTestId}
    >
      {children}
    </motion.div>
  );
}
