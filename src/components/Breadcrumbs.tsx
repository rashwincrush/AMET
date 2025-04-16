import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  homeHref?: string;
  className?: string;
}

/**
 * A breadcrumb navigation component
 */
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  homeHref = '/',
  className = '',
}) => {
  return (
    <nav className={`flex items-center text-sm ${className}`}>
      <ol className="flex items-center space-x-1">
        <li>
          <Link
            href={homeHref}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
          </Link>
        </li>
        
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <li className="flex items-center">
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
              {item.href ? (
                <Link
                  href={item.href}
                  className={`${
                    index === items.length - 1
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground hover:text-foreground transition-colors'
                  }`}
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium">{item.label}</span>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs; 