
-- Fix profiles policies: drop restrictive, recreate as permissive
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Fix user_roles policies
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

CREATE POLICY "Users can view their own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::user_role)
);

-- Fix audit_log policies
DROP POLICY IF EXISTS "Admins and gerentes can view audit logs" ON public.audit_log;
DROP POLICY IF EXISTS "Authenticated users can create audit entries" ON public.audit_log;

CREATE POLICY "Admins and gerentes can view audit logs" ON public.audit_log FOR SELECT USING (
  has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'gerente'::user_role)
);
CREATE POLICY "Authenticated users can create audit entries" ON public.audit_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fix activities policies
DROP POLICY IF EXISTS "Users can view their own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can create their own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can update their own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can delete their own activities" ON public.activities;

CREATE POLICY "Users can view their own activities" ON public.activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own activities" ON public.activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own activities" ON public.activities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own activities" ON public.activities FOR DELETE USING (auth.uid() = user_id);

-- Fix osi_activities policies
DROP POLICY IF EXISTS "Users can view their own osi activities" ON public.osi_activities;
DROP POLICY IF EXISTS "Users can create their own osi activities" ON public.osi_activities;
DROP POLICY IF EXISTS "Users can update their own osi activities" ON public.osi_activities;
DROP POLICY IF EXISTS "Users can delete their own osi activities" ON public.osi_activities;

CREATE POLICY "Users can view their own osi activities" ON public.osi_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own osi activities" ON public.osi_activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own osi activities" ON public.osi_activities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own osi activities" ON public.osi_activities FOR DELETE USING (auth.uid() = user_id);

-- Fix activity_statuses policies
DROP POLICY IF EXISTS "Anyone can view statuses" ON public.activity_statuses;
DROP POLICY IF EXISTS "Admins and gerentes can manage statuses" ON public.activity_statuses;

CREATE POLICY "Anyone can view statuses" ON public.activity_statuses FOR SELECT USING (true);
CREATE POLICY "Admins and gerentes can manage statuses" ON public.activity_statuses FOR ALL USING (
  has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'gerente'::user_role)
);

-- Fix activity_comments policies
DROP POLICY IF EXISTS "Users can view comments on their activities" ON public.activity_comments;
DROP POLICY IF EXISTS "Authenticated users can add comments" ON public.activity_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.activity_comments;

CREATE POLICY "Users can view comments on their activities" ON public.activity_comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM activities WHERE activities.id = activity_comments.activity_id AND activities.user_id = auth.uid()) OR user_id = auth.uid()
);
CREATE POLICY "Authenticated users can add comments" ON public.activity_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.activity_comments FOR DELETE USING (auth.uid() = user_id);

-- Fix activity_attachments policies
DROP POLICY IF EXISTS "Users can view attachments on their activities" ON public.activity_attachments;
DROP POLICY IF EXISTS "Authenticated users can add attachments" ON public.activity_attachments;
DROP POLICY IF EXISTS "Users can delete their own attachments" ON public.activity_attachments;

CREATE POLICY "Users can view attachments on their activities" ON public.activity_attachments FOR SELECT USING (
  EXISTS (SELECT 1 FROM activities WHERE activities.id = activity_attachments.activity_id AND activities.user_id = auth.uid()) OR user_id = auth.uid()
);
CREATE POLICY "Authenticated users can add attachments" ON public.activity_attachments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own attachments" ON public.activity_attachments FOR DELETE USING (auth.uid() = user_id);
