/**
 * Centralized configuration for all API routes
 * This ensures consistent settings across our API
 */

// Force dynamic setting to prevent static generation of API routes
export const dynamic = 'force-dynamic';

// Prevent caching of API responses
export const fetchCache = 'force-no-store';

// Set to zero to disable revalidation for API routes
export const revalidate = 0;

// Use nodejs runtime for better compatibility
export const runtime = 'nodejs'; 