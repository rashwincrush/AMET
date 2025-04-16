// apiTypes.ts
export type UserProfile = {
  id: string;
  first_name: string;
  last_name: string;
  graduation_year?: number;
  degree?: string;
  major?: string;
  current_company?: string;
  current_position?: string;
  location?: string;
  bio?: string;
  linkedin_url?: string;
  twitter_url?: string;
};

export type Achievement = {
  id: string;
  title: string;
  description?: string;
  year?: number;
  url?: string;
  achievement_type?: 'professional' | 'academic' | 'personal' | 'other';
  created_at?: string;
};
