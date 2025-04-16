-- Admin Dashboard Schema

-- Role Management
CREATE TABLE IF NOT EXISTS roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Roles
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, role_id)
);

-- Enable RLS on roles and user_roles
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policies for roles
-- Only admins can manage roles
CREATE POLICY "Admins can manage roles" ON roles
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      JOIN roles r ON user_roles.role_id = r.id
      WHERE user_roles.profile_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- Anyone can view roles
CREATE POLICY "Anyone can view roles" ON roles
  FOR SELECT USING (true);

-- Policies for user_roles
-- Only admins can manage user roles
CREATE POLICY "Admins can manage user roles" ON user_roles
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.profile_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- Users can view their own roles
CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (profile_id = auth.uid());

-- Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on activity_logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Policies for activity_logs
-- Only admins can view all activity logs
CREATE POLICY "Admins can view all activity logs" ON activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      JOIN roles r ON user_roles.role_id = r.id
      WHERE user_roles.profile_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- Users can view their own activity logs
CREATE POLICY "Users can view their own activity logs" ON activity_logs
  FOR SELECT USING (profile_id = auth.uid());

-- Only the system can insert activity logs
CREATE POLICY "System can insert activity logs" ON activity_logs
  FOR INSERT WITH CHECK (true);

-- System Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (profile_id = auth.uid());

-- Users can update their own notifications (e.g., mark as read)
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (profile_id = auth.uid());

-- Only the system can insert notifications
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Approval Workflows
CREATE TABLE IF NOT EXISTS approval_workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  entity_type TEXT NOT NULL,
  approvers JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approval_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES approval_workflows(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  requester_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  approvals JSONB DEFAULT '[]',
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on approval tables
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;

-- Policies for approval_workflows
-- Only admins can manage approval workflows
CREATE POLICY "Admins can manage approval workflows" ON approval_workflows
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      JOIN roles r ON user_roles.role_id = r.id
      WHERE user_roles.profile_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- Anyone can view approval workflows
CREATE POLICY "Anyone can view approval workflows" ON approval_workflows
  FOR SELECT USING (true);

-- Policies for approval_requests
-- Requesters can view their own requests
CREATE POLICY "Requesters can view their own approval requests" ON approval_requests
  FOR SELECT USING (requester_id = auth.uid());

-- Approvers can view requests they need to approve
CREATE POLICY "Approvers can view relevant approval requests" ON approval_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM approval_workflows
      WHERE approval_workflows.id = workflow_id
      AND approval_workflows.approvers::jsonb @> jsonb_build_array(auth.uid()::text)
    )
  );

-- Requesters can create approval requests
CREATE POLICY "Requesters can create approval requests" ON approval_requests
  FOR INSERT WITH CHECK (requester_id = auth.uid());

-- Approvers can update approval requests
CREATE POLICY "Approvers can update approval requests" ON approval_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM approval_workflows
      WHERE approval_workflows.id = workflow_id
      AND approval_workflows.approvers::jsonb @> jsonb_build_array(auth.uid()::text)
    )
  );

-- Content Management
CREATE TABLE IF NOT EXISTS content_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  meta_description TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  last_editor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on content_pages
ALTER TABLE content_pages ENABLE ROW LEVEL SECURITY;

-- Policies for content_pages
-- Anyone can view published content pages
CREATE POLICY "Anyone can view published content pages" ON content_pages
  FOR SELECT USING (is_published = TRUE);

-- Content editors can view all content pages
CREATE POLICY "Content editors can view all content pages" ON content_pages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      JOIN roles r ON user_roles.role_id = r.id
      WHERE user_roles.profile_id = auth.uid()
      AND (r.name = 'admin' OR r.name = 'content_editor')
    )
  );

-- Content editors can manage content pages
CREATE POLICY "Content editors can manage content pages" ON content_pages
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      JOIN roles r ON user_roles.role_id = r.id
      WHERE user_roles.profile_id = auth.uid()
      AND (r.name = 'admin' OR r.name = 'content_editor')
    )
  );

-- Create triggers for the new tables
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_approval_workflows_updated_at
  BEFORE UPDATE ON approval_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_approval_requests_updated_at
  BEFORE UPDATE ON approval_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_content_pages_updated_at
  BEFORE UPDATE ON content_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Insert default roles
INSERT INTO roles (name, description, permissions)
VALUES 
  ('admin', 'Full system access', '{"all": true}'::jsonb),
  ('moderator', 'Can moderate content and users', '{"moderate_content": true, "moderate_users": true}'::jsonb),
  ('content_editor', 'Can manage content pages', '{"manage_content": true}'::jsonb),
  ('alumni', 'Regular alumni user', '{"view_content": true, "participate": true}'::jsonb)
ON CONFLICT (name) DO NOTHING;