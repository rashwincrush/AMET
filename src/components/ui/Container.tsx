'use client';

import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
  centered?: boolean;
}

/**
 * A responsive container component that provides consistent width constraints
 * and padding based on screen size.
 */
export function Container({
  children,
  className = '',
  size = 'lg',
  padding = true,
  centered = true,
}: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    full: 'max-w-full',
  };

  const classes = [
    sizeClasses[size],
    padding ? 'px-4 sm:px-6 lg:px-8' : '',
    centered ? 'mx-auto' : '',
    'w-full',
    className,
  ].filter(Boolean).join(' ');

  return <div className={classes}>{children}</div>;
}