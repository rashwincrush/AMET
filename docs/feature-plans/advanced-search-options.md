# Advanced Search Options Implementation Plan

## Overview
Implement enhanced search functionality for the Alumni Management System with advanced filtering options, keyword search, and a clean, mobile-friendly interface.

## Implementation Approach

### 1. Dropdown Filters
- Add filters for graduation year, major, location, and other profile attributes
- Implement multi-select capabilities for applicable filters
- Create save/load functionality for frequent searches
- Add clear all filters option

### 2. Keyword Search
- Implement full-text search across profile fields
- Add search highlighting for matched terms
- Create search suggestions based on common queries
- Implement search history for quick access to previous searches

### 3. Search Results Interface
- Design a clean, card-based layout for search results
- Implement responsive design for mobile compatibility
- Add sorting options (alphabetical, graduation year, etc.)
- Create pagination with adjustable results per page

## Technical Implementation

### Database Changes
```sql
-- Enable full text search on profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create a function to update the search vector
CREATE OR REPLACE FUNCTION profiles_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector = 
     setweight(to_tsvector('english', coalesce(NEW.first_name, '')), 'A') ||
     setweight(to_tsvector('english', coalesce(NEW.last_name, '')), 'A') ||
     setweight(to_tsvector('english', coalesce(NEW.major, '')), 'B') ||
     setweight(to_tsvector('english', coalesce(NEW.company, '')), 'B') ||
     setweight(to_tsvector('english', coalesce(NEW.job_title, '')), 'B') ||
     setweight(to_tsvector('english', coalesce(NEW.location, '')), 'C') ||
     setweight(to_tsvector('english', coalesce(NEW.bio, '')), 'D');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Create a trigger to update the search vector on insert or update
CREATE TRIGGER profiles_search_vector_update
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION profiles_search_vector_update();

-- Create an index on the search vector
CREATE INDEX IF NOT EXISTS profiles_search_vector_idx ON profiles USING gin(search_vector);

-- Create saved searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- Users can only access their own saved searches
CREATE POLICY "Users can manage their own saved searches"
  ON saved_searches
  FOR ALL
  USING (auth.uid() = user_id);
```

### Search API Implementation

#### Backend Search Function
```typescript
async function searchProfiles(query: string, filters: any, page: number, limit: number) {
  let supabaseQuery = supabase
    .from('profiles')
    .select('*', { count: 'exact' });
  
  // Apply text search if query is provided
  if (query && query.trim() !== '') {
    supabaseQuery = supabaseQuery.textSearch(
      'search_vector',
      query.trim(),
      {
        config: 'english',
        type: 'websearch'
      }
    );
  }
  
  // Apply filters
  if (filters) {
    // Graduation year filter
    if (filters.graduationYear && filters.graduationYear.length > 0) {
      supabaseQuery = supabaseQuery.in('graduation_year', filters.graduationYear);
    }
    
    // Major filter
    if (filters.major && filters.major.length > 0) {
      supabaseQuery = supabaseQuery.in('major', filters.major);
    }
    
    // Location filter
    if (filters.location && filters.location.length > 0) {
      supabaseQuery = supabaseQuery.in('location', filters.location);
    }
    
    // Role filter (requires join)
    if (filters.role && filters.role.length > 0) {
      supabaseQuery = supabaseQuery.in('id', (sb) => {
        return sb
          .from('user_roles')
          .select('profile_id')
          .in('role_id', (sb2) => {
            return sb2
              .from('roles')
              .select('id')
              .in('name', filters.role);
          });
      });
    }
    
    // Is mentor filter
    if (filters.isMentor !== undefined) {
      supabaseQuery = supabaseQuery.eq('is_mentor', filters.isMentor);
    }
  }
  
  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  supabaseQuery = supabaseQuery.range(from, to);
  
  // Execute query
  const { data, count, error } = await supabaseQuery;
  
  return { data, count, error };
}
```

### API Endpoints
- `GET /api/search/profiles`: Search profiles with filters
- `GET /api/search/filters`: Get available filter options
- `POST /api/search/save`: Save a search configuration
- `GET /api/search/saved`: Get user's saved searches
- `DELETE /api/search/saved/:id`: Delete a saved search

## UI Components

### Search Form
- Keyword search input with autocomplete
- Collapsible filter sections
- Filter chips for active filters
- Save search button

### Filter Controls
- Graduation year dropdown (multi-select)
- Major dropdown (multi-select)
- Location dropdown (multi-select)
- Role checkbox group
- Mentor toggle

### Search Results
- Card-based layout with profile summary
- Pagination controls
- Sort options dropdown
- Results count indicator
- No results message with suggestions

### Mobile Considerations
- Collapsible filter panel for small screens
- Touch-friendly controls
- Responsive card layout
- Simplified filter UI on mobile

## Performance Considerations
- Implement debouncing for keyword search
- Use client-side filtering for fast response
- Cache common filter options
- Implement virtual scrolling for large result sets
- Optimize database queries with proper indexing

## Testing Plan
1. Test search with various keyword combinations
2. Test filter combinations for accuracy
3. Test search performance with large datasets
4. Test mobile responsiveness
5. Test saved searches functionality
6. Test edge cases (no results, many filters, etc.)

## Deployment Plan
1. Apply database changes
2. Update the search vector for existing profiles
3. Implement backend search API
4. Develop frontend components
5. Test in staging environment
6. Deploy to production
