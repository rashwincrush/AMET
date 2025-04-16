'use client';

import React from 'react';

interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'none' | 'small' | 'medium' | 'large';
}

/**
 * A responsive grid component that adapts to different screen sizes
 * using CSS Grid with configurable columns and gaps.
 */
export function Grid({
  children,
  className = '',
  cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 },
  gap = 'medium',
}: GridProps) {
  const colClasses = {
    xs: cols.xs ? `grid-cols-${cols.xs}` : '',
    sm: cols.sm ? `sm:grid-cols-${cols.sm}` : '',
    md: cols.md ? `md:grid-cols-${cols.md}` : '',
    lg: cols.lg ? `lg:grid-cols-${cols.lg}` : '',
    xl: cols.xl ? `xl:grid-cols-${cols.xl}` : '',
  };

  const gapClasses = {
    none: 'gap-0',
    small: 'gap-2 sm:gap-3',
    medium: 'gap-4 sm:gap-5 md:gap-6',
    large: 'gap-6 sm:gap-8 md:gap-10',
  };

  const classes = [
    'grid',
    colClasses.xs,
    colClasses.sm,
    colClasses.md,
    colClasses.lg,
    colClasses.xl,
    gapClasses[gap],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
}