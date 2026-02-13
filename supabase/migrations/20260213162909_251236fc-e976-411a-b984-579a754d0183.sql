
-- Notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  email_deadlines BOOLEAN NOT NULL DEFAULT true,
  email_status_changes BOOLEAN NOT NULL DEFAULT true,
  email_new_assignments BOOLEAN NOT NULL DEFAULT true,
  email_daily_summary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
ON public.notification_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON public.notification_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.notification_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- Allow admins and gerentes to view ALL activities (for multi-team dashboard)
CREATE POLICY "Admins can view all activities"
ON public.activities FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Gerentes can view all activities"
ON public.activities FOR SELECT
USING (has_role(auth.uid(), 'gerente'::user_role));

-- Allow admins and gerentes to view ALL OSI activities
CREATE POLICY "Admins can view all osi activities"
ON public.osi_activities FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Gerentes can view all osi activities"
ON public.osi_activities FOR SELECT
USING (has_role(auth.uid(), 'gerente'::user_role));

-- Allow admins/gerentes to view all profiles for team dashboard
-- (already has "Profiles are viewable by authenticated users" policy)

-- Create trigger for auto-creating notification preferences on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_preferences
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_preferences();
