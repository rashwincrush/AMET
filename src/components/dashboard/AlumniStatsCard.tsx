'use client';

import { Card } from '@/components/ui/card';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Users, GraduationCap, Briefcase, MapPin } from 'lucide-react';

export function AlumniStatsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alumni Statistics</CardTitle>
        <CardDescription>Overview of alumni network</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center">
            <Users className="h-8 w-8 text-primary mb-2" />
            <span className="text-2xl font-bold">1,234</span>
            <span className="text-sm text-muted-foreground">Total Alumni</span>
          </div>
          <div className="flex flex-col items-center">
            <GraduationCap className="h-8 w-8 text-primary mb-2" />
            <span className="text-2xl font-bold">85%</span>
            <span className="text-sm text-muted-foreground">Employed</span>
          </div>
          <div className="flex flex-col items-center">
            <Briefcase className="h-8 w-8 text-primary mb-2" />
            <span className="text-2xl font-bold">321</span>
            <span className="text-sm text-muted-foreground">Active Jobs</span>
          </div>
          <div className="flex flex-col items-center">
            <MapPin className="h-8 w-8 text-primary mb-2" />
            <span className="text-2xl font-bold">45</span>
            <span className="text-sm text-muted-foreground">Countries</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
