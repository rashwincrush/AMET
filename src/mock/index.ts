// Export all mock data from a single file for easy imports
export * from './events';
export * from './jobs';
export * from './alumni';
export * from './messages';

// Helper function to determine if mock data should be used
export const useMockData = (): boolean => {
  // Check if environment variable is set to use mock data
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
};
