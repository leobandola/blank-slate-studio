
-- Activity templates table
CREATE TABLE public.activity_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own templates" ON public.activity_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own templates" ON public.activity_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own templates" ON public.activity_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own templates" ON public.activity_templates FOR DELETE USING (auth.uid() = user_id);

-- Recurring activities table
CREATE TABLE public.recurring_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  template_data JSONB NOT NULL DEFAULT '{}',
  frequency TEXT NOT NULL DEFAULT 'daily',
  days_of_week INTEGER[] DEFAULT '{}',
  day_of_month INTEGER,
  start_date TEXT NOT NULL,
  end_date TEXT,
  last_generated_date TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.recurring_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own recurring" ON public.recurring_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own recurring" ON public.recurring_activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recurring" ON public.recurring_activities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own recurring" ON public.recurring_activities FOR DELETE USING (auth.uid() = user_id);

-- Goals table
CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  target_count INTEGER NOT NULL DEFAULT 0,
  period TEXT NOT NULL DEFAULT 'monthly',
  metric TEXT NOT NULL DEFAULT 'activities_completed',
  start_date TEXT NOT NULL,
  end_date TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own goals" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own goals" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goals" ON public.goals FOR DELETE USING (auth.uid() = user_id);
