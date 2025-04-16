/**
 * Utility functions for managing navigation and redirects
 */

// Save the current URL to localStorage
export const savePreviousUrl = () => {
  // Don't save auth-related pages as return URLs
  if (
    typeof window !== 'undefined' && 
    !window.location.pathname.startsWith('/auth/') &&
    window.location.pathname !== '/'
  ) {
    localStorage.setItem('previousUrl', window.location.pathname + window.location.search);
  }
};

// Get the saved URL or return the default
export const getPreviousUrl = (defaultUrl = '/') => {
  if (typeof window === 'undefined') return defaultUrl;
  
  const previousUrl = localStorage.getItem('previousUrl');
  // Clear the stored URL after retrieving it
  localStorage.removeItem('previousUrl');
  
  return previousUrl || defaultUrl;
};
