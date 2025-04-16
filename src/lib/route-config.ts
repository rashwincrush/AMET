// Force dynamic API routes to avoid SSR issues
export const dynamic = 'force-dynamic';

// Export other common route configs if needed
export const runtime = 'nodejs';

/**
 * This file should be imported by all API routes to ensure they work correctly 
 * with the Vercel deployment environment. Import it at the top of your route.ts files:
 * 
 * import { dynamic } from '@/lib/route-config';
 */ 