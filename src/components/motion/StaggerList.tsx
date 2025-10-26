'use client';

import React from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { staggerContainer, staggerItem, getMotionVariants } from '@/lib/motion/variants';

export interface StaggerListProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
  'data-testid'?: string;
}

export function StaggerList({
  children,
  staggerDelay = 0.1,
  className = '',
  'data-testid': dataTestId,
}: StaggerListProps) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const prefersReducedMotion = useReducedMotion() ?? false;

  const containerVariants = getMotionVariants(
    {
      ...staggerContainer,
      visible: {
        ...staggerContainer.visible,
        transition: {
          staggerChildren: staggerDelay,
        },
      },
    },
    prefersReducedMotion
  );

  const itemVariants = getMotionVariants(staggerItem, prefersReducedMotion);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={className}
      data-testid={dataTestId}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="motion-child"
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
