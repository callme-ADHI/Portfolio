-- Add category field to projects table
ALTER TABLE public.projects 
ADD COLUMN category text DEFAULT 'Uncategorized';