'use client';

import React from 'react';

interface FlexProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'row-reverse' | 'col' | 'col-reverse';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  items?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  gap?: 'none' | 'small' | 'medium' | 'large';
  responsive?: boolean;
}

/**
 * A responsive flex component that adapts to different screen sizes
 * using Flexbox with configurable properties.
 */
export function Flex({
  children,
  className = '',
  direction = 'row',
  wrap = 'nowrap',
  justify = 'start',
  items = 'start',
  gap = 'medium',
  responsive = true,
}: FlexProps) {
  const directionClasses = {
    row: responsive ? 'flex-col md:flex-row' : 'flex-row',
    'row-reverse': responsive ? 'flex-col-reverse md:flex-row-reverse' : 'flex-row-reverse',
    col: 'flex-col',
    'col-reverse': 'flex-col-reverse',
  };

  const wrapClasses = {
    nowrap: 'flex-nowrap',
    wrap: 'flex-wrap',
    'wrap-reverse': 'flex-wrap-reverse',
  };

  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  const itemsClasses = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
  };

  const gapClasses = {
    none: 'gap-0',
    small: 'gap-2 md:gap-3',
    medium: 'gap-4 md:gap-6',
    large: 'gap-6 md:gap-8',
  };

  const classes = [
    'flex',
    directionClasses[direction],
    wrapClasses[wrap],
    justifyClasses[justify],
    itemsClasses[items],
    gapClasses[gap],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
}