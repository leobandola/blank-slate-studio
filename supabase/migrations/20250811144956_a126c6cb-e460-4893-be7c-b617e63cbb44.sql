-- Add status column to osi_activities table
ALTER TABLE public.osi_activities 
ADD COLUMN status text NOT NULL DEFAULT 'PENDENTE';