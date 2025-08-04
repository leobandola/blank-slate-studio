-- Create table for OSI activities
CREATE TABLE public.osi_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  data DATE NOT NULL,
  obra TEXT NOT NULL,
  atividade TEXT NOT NULL,
  osi TEXT NOT NULL,
  ativacao TEXT NOT NULL,
  equipe_campo TEXT NOT NULL,
  equipe_configuracao TEXT NOT NULL,
  obs TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.osi_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own osi activities" 
ON public.osi_activities 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own osi activities" 
ON public.osi_activities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own osi activities" 
ON public.osi_activities 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own osi activities" 
ON public.osi_activities 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_osi_activities_updated_at
BEFORE UPDATE ON public.osi_activities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();