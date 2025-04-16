import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Card, CardContent, CardTitle } from './ui/card';

interface NoDataProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * A component to display when no data is available
 */
const NoData: React.FC<NoDataProps> = ({
  title = "No Data Available",
  message = "There are no items to display at this time.",
  icon = <FolderOpen className="h-12 w-12 text-muted-foreground" />,
  className = "",
}) => {
  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-10 text-center">
        <div className="mb-4">{icon}</div>
        <CardTitle className="text-xl mb-2">{title}</CardTitle>
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
};

export default NoData; 