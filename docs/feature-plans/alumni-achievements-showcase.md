# Alumni Achievements Showcase Implementation Plan

## Overview
Implement an achievements showcase feature that allows alumni to highlight their professional, academic, and community accomplishments on their profiles, with admin approval functionality.

## Implementation Approach

### 1. Achievements Schema
- Add an achievements section to the profile schema
- Create categories for different types of achievements
- Implement media attachment support for certificates/photos
- Add verification status for admin approval

### 2. Achievement Form
- Create a user-friendly form for adding/editing achievements
- Implement rich text editor for achievement descriptions
- Add date selection for achievement timeline
- Include media upload functionality

### 3. Profile Display
- Design an attractive achievements section for profile pages
- Create a timeline view of achievements
- Implement filtering by achievement category
- Add social sharing functionality for achievements

## Technical Implementation

### Database Schema
```sql
-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  achievement_date DATE,
  category TEXT NOT NULL,
  organization TEXT,
  url TEXT,
  media_url TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create achievement categories enum
CREATE TYPE achievement_category AS ENUM (
  'professional',
  'academic',
  'community',
  'award',
  'certification',
  'publication',
  'other'
);

-- Add RLS policies
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Users can read all approved achievements
CREATE POLICY "Anyone can view approved achievements"
  ON achievements
  FOR SELECT
  USING (is_approved = TRUE);

-- Users can manage their own achievements
CREATE POLICY "Users can manage their own achievements"
  ON achievements
  FOR ALL
  USING (auth.uid() = user_id);

-- Admins can manage all achievements
CREATE POLICY "Admins can manage all achievements"
  ON achievements
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.profile_id = auth.uid()
      AND r.name IN ('super_admin', 'admin', 'moderator')
    )
  );
```

### API Endpoints
- `GET /api/achievements`: Get achievements for current user
- `GET /api/achievements/:userId`: Get approved achievements for a specific user
- `POST /api/achievements`: Create a new achievement
- `PUT /api/achievements/:id`: Update an achievement
- `DELETE /api/achievements/:id`: Delete an achievement
- `PUT /api/achievements/:id/approve`: Approve an achievement (admin only)
- `PUT /api/achievements/:id/feature`: Feature an achievement (admin only)

## UI Components

### Achievement Form
```tsx
interface AchievementFormProps {
  userId: string;
  achievement?: Achievement;
  onSuccess: () => void;
}

export default function AchievementForm({ userId, achievement, onSuccess }: AchievementFormProps) {
  const [title, setTitle] = useState(achievement?.title || '');
  const [description, setDescription] = useState(achievement?.description || '');
  const [achievementDate, setAchievementDate] = useState(achievement?.achievement_date || '');
  const [category, setCategory] = useState(achievement?.category || 'professional');
  const [organization, setOrganization] = useState(achievement?.organization || '');
  const [url, setUrl] = useState(achievement?.url || '');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Upload media file if provided
      let mediaUrl = achievement?.media_url || null;
      if (mediaFile) {
        const { data, error } = await supabase.storage
          .from('achievement-media')
          .upload(`${userId}/${Date.now()}-${mediaFile.name}`, mediaFile);
          
        if (error) throw error;
        mediaUrl = data.path;
      }
      
      // Create or update achievement
      const achievementData = {
        user_id: userId,
        title,
        description,
        achievement_date: achievementDate,
        category,
        organization,
        url,
        media_url: mediaUrl,
        updated_at: new Date().toISOString()
      };
      
      if (achievement) {
        // Update existing achievement
        const { error } = await supabase
          .from('achievements')
          .update(achievementData)
          .eq('id', achievement.id);
          
        if (error) throw error;
      } else {
        // Create new achievement
        const { error } = await supabase
          .from('achievements')
          .insert(achievementData);
          
        if (error) throw error;
      }
      
      toast.success(`Achievement ${achievement ? 'updated' : 'created'} successfully`);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save achievement');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      
      {/* Other form fields */}
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Achievement'}
        </button>
      </div>
    </form>
  );
}
```

### Achievement Display
```tsx
interface AchievementDisplayProps {
  userId: string;
  isOwnProfile: boolean;
}

export default function AchievementDisplay({ userId, isOwnProfile }: AchievementDisplayProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadAchievements() {
      try {
        setLoading(true);
        
        let query = supabase
          .from('achievements')
          .select('*')
          .eq('user_id', userId)
          .order('achievement_date', { ascending: false });
          
        // If not own profile, only show approved achievements
        if (!isOwnProfile) {
          query = query.eq('is_approved', true);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        setAchievements(data || []);
      } catch (error) {
        console.error('Error loading achievements:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadAchievements();
  }, [userId, isOwnProfile]);
  
  const filteredAchievements = selectedCategory
    ? achievements.filter(a => a.category === selectedCategory)
    : achievements;
    
  const categories = [...new Set(achievements.map(a => a.category))];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Achievements</h2>
        {isOwnProfile && (
          <button
            onClick={() => {/* Open add achievement modal */}}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Achievement
          </button>
        )}
      </div>
      
      {achievements.length > 0 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-full text-sm ${!selectedCategory ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm ${selectedCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">
          <p>Loading achievements...</p>
        </div>
      ) : filteredAchievements.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            {achievements.length === 0
              ? 'No achievements added yet.'
              : 'No achievements in this category.'}
          </p>
          {isOwnProfile && achievements.length === 0 && (
            <button
              onClick={() => {/* Open add achievement modal */}}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Add your first achievement
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAchievements.map(achievement => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              isOwnProfile={isOwnProfile}
              onEdit={() => {/* Open edit achievement modal */}}
              onDelete={() => {/* Handle delete */}}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Admin Approval Interface
```tsx
export default function AchievementApprovalDashboard() {
  const [pendingAchievements, setPendingAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadPendingAchievements() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('achievements')
          .select('*, profiles(first_name, last_name)')
          .eq('is_approved', false)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setPendingAchievements(data || []);
      } catch (error) {
        console.error('Error loading pending achievements:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadPendingAchievements();
  }, []);
  
  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('achievements')
        .update({ is_approved: true })
        .eq('id', id);
        
      if (error) throw error;
      
      // Remove from pending list
      setPendingAchievements(prev => prev.filter(a => a.id !== id));
      toast.success('Achievement approved');
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve achievement');
    }
  };
  
  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Remove from pending list
      setPendingAchievements(prev => prev.filter(a => a.id !== id));
      toast.success('Achievement rejected');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject achievement');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Achievement Approval</h1>
      
      {loading ? (
        <div className="text-center py-8">
          <p>Loading pending achievements...</p>
        </div>
      ) : pendingAchievements.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No pending achievements to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingAchievements.map(achievement => (
            <div key={achievement.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{achievement.title}</h3>
                  <p className="text-sm text-gray-500">
                    By {achievement.profiles.first_name} {achievement.profiles.last_name}
                  </p>
                  <p className="mt-2">{achievement.description}</p>
                  {/* Other achievement details */}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApprove(achievement.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(achievement.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Storage Configuration
- Create an `achievement-media` bucket in Supabase Storage
- Set appropriate permissions for file uploads
- Configure file size limits and allowed file types

## Admin Dashboard Integration
- Add an Achievement Approval section to the admin dashboard
- Display count of pending achievements
- Provide quick access to the approval interface

## Testing Plan
1. Test achievement creation with various media types
2. Test achievement display on profile pages
3. Test filtering by achievement category
4. Test admin approval workflow
5. Test achievements on mobile devices
6. Test achievement editing and deletion

## Deployment Plan
1. Create the achievements table and storage bucket
2. Implement backend API endpoints
3. Develop frontend components
4. Add admin approval interface
5. Test in staging environment
6. Deploy to production with user documentation
