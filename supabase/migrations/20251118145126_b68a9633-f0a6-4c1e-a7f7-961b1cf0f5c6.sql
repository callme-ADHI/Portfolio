-- Add featured flag to projects table to mark projects for homepage display
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;