
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Anyone can view statuses" ON public.activity_statuses;
DROP POLICY IF EXISTS "Admins and gerentes can manage statuses" ON public.activity_statuses;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Anyone can view statuses"
  ON public.activity_statuses
  FOR SELECT
  USING (true);

CREATE POLICY "Admins and gerentes can manage statuses"
  ON public.activity_statuses
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'gerente'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'gerente'::user_role));
