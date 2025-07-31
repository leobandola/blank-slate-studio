-- Create table for activity statuses
CREATE TABLE public.activity_statuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for activities
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  data DATE NOT NULL,
  hora TEXT NOT NULL,
  obra TEXT NOT NULL,
  site TEXT NOT NULL,
  ots_osi TEXT NOT NULL,
  designacao TEXT NOT NULL,
  equipe_configuracao TEXT NOT NULL,
  cidade TEXT NOT NULL,
  empresa TEXT NOT NULL,
  equipe TEXT NOT NULL,
  atividade TEXT NOT NULL,
  observacao TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.activity_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create policies for activity_statuses (shared across all users)
CREATE POLICY "Anyone can view activity statuses" 
ON public.activity_statuses 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert activity statuses" 
ON public.activity_statuses 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update activity statuses" 
ON public.activity_statuses 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete activity statuses" 
ON public.activity_statuses 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create policies for activities (user-specific)
CREATE POLICY "Users can view their own activities" 
ON public.activities 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activities" 
ON public.activities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities" 
ON public.activities 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities" 
ON public.activities 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_activity_statuses_updated_at
  BEFORE UPDATE ON public.activity_statuses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default statuses
INSERT INTO public.activity_statuses (name, color) VALUES
  ('Concluído', '#22c55e'),
  ('Em Andamento', '#f59e0b'),
  ('Pendente', '#ef4444'),
  ('Cancelado', '#64748b');