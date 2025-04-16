// Force all API routes to be dynamic
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

// This file is imported in all API routes to ensure they're skipped during static export
// but properly handled during runtime 