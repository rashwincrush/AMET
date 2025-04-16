/**
 * Central configuration for dynamic API routes
 * This helps ensure consistent behavior across all API routes
 */

// Set to force-dynamic to ensure API routes are not statically generated
export const dynamic = 'force-dynamic';

// Export other common configurations that might be needed
export const fetchCache = 'force-no-store';
export const revalidate = 0; 