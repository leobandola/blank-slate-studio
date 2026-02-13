
-- Create subtasks table for checklist items within activities
CREATE TABLE public.subtasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view subtasks on their activities"
ON public.subtasks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create subtasks"
ON public.subtasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their subtasks"
ON public.subtasks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their subtasks"
ON public.subtasks FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for activities and osi_activities
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.osi_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subtasks;
