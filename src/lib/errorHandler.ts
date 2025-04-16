// errorHandler.ts
export const handleError = (error: any) => {
  console.error('API Error:', error);
  // Optionally, you can throw a user-friendly error message
  throw new Error('An error occurred while processing your request.');
};
