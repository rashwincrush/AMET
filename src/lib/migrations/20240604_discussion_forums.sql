-- Discussion Forums Schema
CREATE TABLE IF NOT EXISTS forums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('general', 'career', 'academic', 'events', 'networking', 'other')),
  image_url TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on forums
ALTER TABLE forums ENABLE ROW LEVEL SECURITY;

-- Policies for forums
-- Anyone can view public forums
CREATE POLICY "Anyone can view public forums" ON forums
  FOR SELECT USING (is_private = FALSE AND is_approved = TRUE);

-- Forum members can view private forums they belong to
CREATE POLICY "Forum members can view private forums" ON forums
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forum_members 
      WHERE forum_members.forum_id = id AND forum_members.profile_id = auth.uid()
    )
  );

-- Creators can update their own forums
CREATE POLICY "Creators can update their own forums" ON forums
  FOR UPDATE USING (auth.uid() = creator_id);

-- Creators can delete their own forums
CREATE POLICY "Creators can delete their own forums" ON forums
  FOR DELETE USING (auth.uid() = creator_id);

-- Forum Topics Schema
CREATE TABLE IF NOT EXISTS forum_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  forum_id UUID REFERENCES forums(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on forum_topics
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;

-- Policies for forum_topics
-- Anyone can view topics in public forums
CREATE POLICY "Anyone can view topics in public forums" ON forum_topics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forums
      WHERE forums.id = forum_id AND forums.is_private = FALSE AND forums.is_approved = TRUE
    )
  );

-- Forum members can view topics in their forums
CREATE POLICY "Forum members can view topics in their forums" ON forum_topics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forum_members
      WHERE forum_members.forum_id = forum_id AND forum_members.profile_id = auth.uid()
    )
  );

-- Users can create topics in forums they're members of
CREATE POLICY "Users can create topics in their forums" ON forum_topics
  FOR INSERT WITH CHECK (
    auth.uid() = creator_id AND
    EXISTS (
      SELECT 1 FROM forum_members
      WHERE forum_members.forum_id = forum_id AND forum_members.profile_id = auth.uid()
    )
  );

-- Users can update their own topics
CREATE POLICY "Users can update their own topics" ON forum_topics
  FOR UPDATE USING (auth.uid() = creator_id);

-- Users can delete their own topics
CREATE POLICY "Users can delete their own topics" ON forum_topics
  FOR DELETE USING (auth.uid() = creator_id);

-- Forum Posts Schema (replies to topics)
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on forum_posts
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

-- Policies for forum_posts
-- Anyone can view posts in public forums
CREATE POLICY "Anyone can view posts in public forums" ON forum_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forum_topics
      JOIN forums ON forum_topics.forum_id = forums.id
      WHERE forum_topics.id = topic_id AND forums.is_private = FALSE AND forums.is_approved = TRUE
    )
  );

-- Forum members can view posts in their forums
CREATE POLICY "Forum members can view posts in their forums" ON forum_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forum_topics
      JOIN forum_members ON forum_topics.forum_id = forum_members.forum_id
      WHERE forum_topics.id = topic_id AND forum_members.profile_id = auth.uid()
    )
  );

-- Users can create posts in topics they can view
CREATE POLICY "Users can create posts in viewable topics" ON forum_posts
  FOR INSERT WITH CHECK (
    auth.uid() = creator_id AND
    EXISTS (
      SELECT 1 FROM forum_topics
      JOIN forums ON forum_topics.forum_id = forums.id
      WHERE forum_topics.id = topic_id AND forum_topics.is_locked = FALSE AND
      (forums.is_private = FALSE OR
        EXISTS (
          SELECT 1 FROM forum_members
          WHERE forum_members.forum_id = forums.id AND forum_members.profile_id = auth.uid()
        )
      )
    )
  );

-- Users can update their own posts
CREATE POLICY "Users can update their own posts" ON forum_posts
  FOR UPDATE USING (auth.uid() = creator_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete their own posts" ON forum_posts
  FOR DELETE USING (auth.uid() = creator_id);

-- Forum Members Schema
CREATE TABLE IF NOT EXISTS forum_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  forum_id UUID REFERENCES forums(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('member', 'moderator', 'admin')) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(forum_id, profile_id)
);

-- Enable RLS on forum_members
ALTER TABLE forum_members ENABLE ROW LEVEL SECURITY;

-- Policies for forum_members
-- Users can view their own memberships
CREATE POLICY "Users can view their own forum memberships" ON forum_members
  FOR SELECT USING (auth.uid() = profile_id);

-- Forum members can view other members in their forums
CREATE POLICY "Forum members can view other members" ON forum_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forum_members AS fm
      WHERE fm.forum_id = forum_id AND fm.profile_id = auth.uid()
    )
  );

-- Users can join public forums
CREATE POLICY "Users can join public forums" ON forum_members
  FOR INSERT WITH CHECK (
    auth.uid() = profile_id AND
    EXISTS (
      SELECT 1 FROM forums
      WHERE forums.id = forum_id AND forums.is_private = FALSE
    )
  );

-- Forum admins can add members to their forums
CREATE POLICY "Forum admins can add members" ON forum_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM forum_members
      WHERE forum_members.forum_id = forum_id AND forum_members.profile_id = auth.uid() AND forum_members.role IN ('admin', 'moderator')
    )
  );

-- Users can leave forums
CREATE POLICY "Users can leave forums" ON forum_members
  FOR DELETE USING (auth.uid() = profile_id);

-- Forum admins can remove members
CREATE POLICY "Forum admins can remove members" ON forum_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM forum_members
      WHERE forum_members.forum_id = forum_id AND forum_members.profile_id = auth.uid() AND forum_members.role IN ('admin', 'moderator')
    )
  );

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_forums_updated_at
  BEFORE UPDATE ON forums
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_forum_topics_updated_at
  BEFORE UPDATE ON forum_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_forum_posts_updated_at
  BEFORE UPDATE ON forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_forum_members_updated_at
  BEFORE UPDATE ON forum_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();