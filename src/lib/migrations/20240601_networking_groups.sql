-- Networking Groups Schema
CREATE TABLE IF NOT EXISTS networking_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('industry', 'interest', 'location', 'graduation_year', 'other')),
  image_url TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on networking_groups
ALTER TABLE networking_groups ENABLE ROW LEVEL SECURITY;

-- Policies for networking_groups
-- Anyone can view public groups
CREATE POLICY "Anyone can view public groups" ON networking_groups
  FOR SELECT USING (is_private = FALSE AND is_approved = TRUE);

-- Group members can view private groups they belong to
CREATE POLICY "Group members can view private groups" ON networking_groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_members.group_id = id AND group_members.profile_id = auth.uid()
    )
  );

-- Creators can update their own groups
CREATE POLICY "Creators can update their own groups" ON networking_groups
  FOR UPDATE USING (auth.uid() = creator_id);

-- Creators can delete their own groups
CREATE POLICY "Creators can delete their own groups" ON networking_groups
  FOR DELETE USING (auth.uid() = creator_id);

-- Group Members Schema
CREATE TABLE IF NOT EXISTS group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES networking_groups(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('member', 'moderator', 'admin')) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, profile_id)
);

-- Enable RLS on group_members
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Policies for group_members
-- Users can view their own memberships
CREATE POLICY "Users can view their own memberships" ON group_members
  FOR SELECT USING (auth.uid() = profile_id);

-- Group members can view other members in their groups
CREATE POLICY "Group members can view other members" ON group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members AS gm
      WHERE gm.group_id = group_id AND gm.profile_id = auth.uid()
    )
  );

-- Users can join public groups
CREATE POLICY "Users can join public groups" ON group_members
  FOR INSERT WITH CHECK (
    auth.uid() = profile_id AND
    EXISTS (
      SELECT 1 FROM networking_groups
      WHERE networking_groups.id = group_id AND networking_groups.is_private = FALSE
    )
  );

-- Group admins can add members to their groups
CREATE POLICY "Group admins can add members" ON group_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_id AND group_members.profile_id = auth.uid() AND group_members.role IN ('admin', 'moderator')
    )
  );

-- Users can leave groups
CREATE POLICY "Users can leave groups" ON group_members
  FOR DELETE USING (auth.uid() = profile_id);

-- Group admins can remove members
CREATE POLICY "Group admins can remove members" ON group_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_id AND group_members.profile_id = auth.uid() AND group_members.role IN ('admin', 'moderator')
    )
  );

-- Group Discussion Posts Schema
CREATE TABLE IF NOT EXISTS group_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES networking_groups(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  is_announcement BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on group_posts
ALTER TABLE group_posts ENABLE ROW LEVEL SECURITY;

-- Policies for group_posts
-- Group members can view posts
CREATE POLICY "Group members can view posts" ON group_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_id AND group_members.profile_id = auth.uid()
    )
  );

-- Group members can create posts
CREATE POLICY "Group members can create posts" ON group_posts
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_id AND group_members.profile_id = auth.uid()
    )
  );

-- Authors can update their own posts
CREATE POLICY "Authors can update their own posts" ON group_posts
  FOR UPDATE USING (auth.uid() = author_id);

-- Group admins can update any post
CREATE POLICY "Group admins can update any post" ON group_posts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_id AND group_members.profile_id = auth.uid() AND group_members.role IN ('admin', 'moderator')
    )
  );

-- Authors can delete their own posts
CREATE POLICY "Authors can delete their own posts" ON group_posts
  FOR DELETE USING (auth.uid() = author_id);

-- Group admins can delete any post
CREATE POLICY "Group admins can delete any post" ON group_posts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_id AND group_members.profile_id = auth.uid() AND group_members.role IN ('admin', 'moderator')
    )
  );

-- Group Post Comments Schema
CREATE TABLE IF NOT EXISTS group_post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES group_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on group_post_comments
ALTER TABLE group_post_comments ENABLE ROW LEVEL SECURITY;

-- Policies for group_post_comments
-- Group members can view comments
CREATE POLICY "Group members can view comments" ON group_post_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_posts
      JOIN group_members ON group_posts.group_id = group_members.group_id
      WHERE group_posts.id = post_id AND group_members.profile_id = auth.uid()
    )
  );

-- Group members can create comments
CREATE POLICY "Group members can create comments" ON group_post_comments
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM group_posts
      JOIN group_members ON group_posts.group_id = group_members.group_id
      WHERE group_posts.id = post_id AND group_members.profile_id = auth.uid()
    )
  );

-- Authors can update their own comments
CREATE POLICY "Authors can update their own comments" ON group_post_comments
  FOR UPDATE USING (auth.uid() = author_id);

-- Authors can delete their own comments
CREATE POLICY "Authors can delete their own comments" ON group_post_comments
  FOR DELETE USING (auth.uid() = author_id);

-- Group admins can delete any comment
CREATE POLICY "Group admins can delete any comment" ON group_post_comments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM group_posts
      JOIN group_members ON group_posts.group_id = group_members.group_id
      WHERE group_posts.id = post_id AND group_members.profile_id = auth.uid() AND group_members.role IN ('admin', 'moderator')
    )
  );

-- Create triggers for the new tables
CREATE TRIGGER update_networking_groups_updated_at
  BEFORE UPDATE ON networking_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_group_members_updated_at
  BEFORE UPDATE ON group_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_group_posts_updated_at
  BEFORE UPDATE ON group_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_group_post_comments_updated_at
  BEFORE UPDATE ON group_post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();