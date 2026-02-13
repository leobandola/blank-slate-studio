
-- Saved filters table
CREATE TABLE public.saved_filters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  filter_type TEXT NOT NULL DEFAULT 'activities',
  filters JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved filters" ON public.saved_filters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own saved filters" ON public.saved_filters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own saved filters" ON public.saved_filters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own saved filters" ON public.saved_filters FOR DELETE USING (auth.uid() = user_id);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  entity_type TEXT,
  entity_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Function to create deadline notifications
CREATE OR REPLACE FUNCTION public.check_deadline_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  activity_record RECORD;
BEGIN
  -- Find activities with deadlines due today or overdue
  FOR activity_record IN
    SELECT a.id, a.obra, a.atividade, a.prazo, a.user_id, a.status
    FROM activities a
    WHERE a.prazo IS NOT NULL
      AND a.prazo != ''
      AND a.status NOT IN ('CONCLUÍDO', 'CANCELADO')
      AND a.prazo::date <= CURRENT_DATE
      AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE n.entity_id = a.id::text
          AND n.entity_type = 'activity_deadline'
          AND n.created_at::date = CURRENT_DATE
      )
  LOOP
    INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id)
    VALUES (
      activity_record.user_id,
      CASE 
        WHEN activity_record.prazo::date < CURRENT_DATE THEN 'Atividade Atrasada!'
        ELSE 'Prazo Vence Hoje!'
      END,
      'Atividade "' || activity_record.atividade || '" na obra "' || activity_record.obra || '"',
      CASE 
        WHEN activity_record.prazo::date < CURRENT_DATE THEN 'warning'
        ELSE 'info'
      END,
      'activity_deadline',
      activity_record.id::text
    );
  END LOOP;
END;
$$;
