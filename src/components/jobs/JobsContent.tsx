'use client';

import React from 'react';
import { FaBriefcase } from 'react-icons/fa';
import EnhancedPageHeader from '@/components/ui/EnhancedPageHeader';

// Simple placeholder component for JobsContent
export default function JobsContent() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <EnhancedPageHeader
        title="Alumni Job Board"
        description="Find career opportunities shared by fellow alumni and industry partners"
        icon={<FaBriefcase className="h-6 w-6 text-blue-500" />}
        background="light"
      />
      <div className="mt-8">
        <p className="text-center text-gray-500">
          Job listings will appear here when available.
        </p>
      </div>
    </div>
  );
}
