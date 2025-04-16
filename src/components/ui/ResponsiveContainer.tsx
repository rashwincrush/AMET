'use client';

import React from 'react';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
}

/**
 * A responsive container component that adapts to different screen sizes
 * and provides consistent padding and max-width constraints.
 */
export function ResponsiveContainer({
  children,
  className = '',
  as: Component = 'div',
  maxWidth = 'xl',
  padding = true,
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  const classes = [
    maxWidthClasses[maxWidth],
    padding ? 'px-4 sm:px-6 md:px-8' : '',
    'mx-auto w-full',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Component className={classes}>
      {children}
    </Component>
  );
}