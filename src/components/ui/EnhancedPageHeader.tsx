'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  background?: 'white' | 'light' | 'gradient' | 'blue' | 'dark';
}

export default function EnhancedPageHeader({ 
  title, 
  description, 
  icon, 
  actions, 
  breadcrumbs,
  background = 'white'
}: PageHeaderProps) {
  const getBgClasses = () => {
    switch (background) {
      case 'light':
        return 'bg-gray-50 border-b border-gray-200';
      case 'gradient':
        return 'bg-gradient-to-r from-blue-600 to-blue-800 text-white';
      case 'blue':
        return 'bg-blue-600 text-white';
      case 'dark':
        return 'bg-gray-900 text-white';
      default:
        return 'bg-white border-b border-gray-200';
    }
  };

  const getTextColors = () => {
    return ['gradient', 'blue', 'dark'].includes(background)
      ? 'text-white' 
      : 'text-gray-800';
  };

  const getSubtitleColors = () => {
    switch(background) {
      case 'gradient':
        return 'text-blue-100';
      case 'blue':
        return 'text-blue-100';
      case 'dark':
        return 'text-gray-300';
      default:
        return 'text-gray-500';
    }
  };

  const getBreadcrumbColors = (isLast: boolean) => {
    if (['gradient', 'blue', 'dark'].includes(background)) {
      return isLast 
        ? 'text-white font-medium' 
        : 'text-blue-200 hover:text-white';
    } else {
      return isLast 
        ? 'text-gray-800 font-medium' 
        : 'text-gray-500 hover:text-gray-700';
    }
  };

  const getBreadcrumbIconColor = () => {
    if (['gradient', 'blue'].includes(background)) {
      return 'text-blue-300';
    } else if (background === 'dark') {
      return 'text-gray-400';
    } else {
      return 'text-gray-400';
    }
  };

  const getIconBgColor = () => {
    switch(background) {
      case 'gradient':
      case 'blue':
        return 'bg-white/10';
      case 'dark':
        return 'bg-gray-800';
      case 'light':
        return 'bg-blue-100';
      default:
        return 'bg-blue-100';
    }
  };

  return (
    <div className={`${getBgClasses()} py-8 mb-6 px-4 sm:px-6 lg:px-0`}>
      <div className="max-w-7xl mx-auto">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-1 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && (
                    <svg 
                      className={`flex-shrink-0 h-4 w-4 ${getBreadcrumbIconColor()}`} 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor" 
                      aria-hidden="true"
                    >
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {crumb.href ? (
                    <a 
                      href={crumb.href} 
                      className={`${index > 0 ? 'ml-1' : ''} ${getBreadcrumbColors(index === breadcrumbs.length - 1)}`}
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span className={`${index > 0 ? 'ml-1' : ''} ${getBreadcrumbColors(true)}`}>
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            {icon && (
              <div className={`flex-shrink-0 p-3 rounded-lg ${getIconBgColor()}`}>
                {icon}
              </div>
            )}
            <div>
              <h1 className={`text-3xl font-bold tracking-tight ${getTextColors()}`}>{title}</h1>
              {description && <p className={`text-base mt-2 ${getSubtitleColors()}`}>{description}</p>}
            </div>
          </div>
          {actions && <div className="flex-shrink-0 flex items-center space-x-3">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
