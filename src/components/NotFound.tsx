import React from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent, CardTitle } from './ui/card';
import { Button } from './ui/button';
import Link from 'next/link';

interface NotFoundProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  buttonText?: string;
  buttonLink?: string;
  className?: string;
}

/**
 * A component to display when a resource is not found
 */
const NotFound: React.FC<NotFoundProps> = ({
  title = "Not Found",
  message = "The resource you're looking for doesn't exist or has been removed.",
  icon = <Search className="h-12 w-12 text-muted-foreground" />,
  buttonText,
  buttonLink,
  className = "",
}) => {
  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-10 text-center">
        <div className="mb-4">{icon}</div>
        <CardTitle className="text-xl mb-2">{title}</CardTitle>
        <p className="text-muted-foreground mb-6">{message}</p>
        
        {buttonText && buttonLink && (
          <Link href={buttonLink}>
            <Button>{buttonText}</Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
};

export default NotFound; 