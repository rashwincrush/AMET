/**
 * Profile utility functions for the AMET Alumni application
 */

/**
 * Generates initials from a name
 * @param name Full name or first name
 * @returns Two character initials
 */
export function getInitials(name?: string): string {
  if (!name || name.trim() === '') return 'AL'; // Default for Alumni
  
  const nameParts = name.trim().split(' ');
  if (nameParts.length === 1) {
    return name.substring(0, 2).toUpperCase();
  }
  
  return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
}

/**
 * Calculates profile completion percentage
 * @param profile User profile data
 * @returns Number from 0-100 representing completion percentage
 */
export function calculateProfileCompletion(profile: any): number {
  if (!profile) return 0;
  
  const fields = [
    'first_name', 'last_name', 'avatar_url', 'graduation_year',
    'degree', 'major', 'current_company', 'current_position',
    'location', 'bio', 'linkedin_url', 'phone_number', 'industry'
  ];
  
  const filledFields = fields.filter(field => 
    profile[field] !== null && 
    profile[field] !== undefined && 
    profile[field] !== ''
  );
  
  return Math.round((filledFields.length / fields.length) * 100);
}
