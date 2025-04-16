'use client';

import { useAppInitialization } from '@/lib/init';

export function AppInitializer() {
  // This component doesn't render anything,
  // it just runs the initialization hook
  useAppInitialization();
  
  return null;
} 