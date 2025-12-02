-- Add phone field to contact_info
ALTER TABLE contact_info ADD COLUMN IF NOT EXISTS phone text;

-- Create resume table
CREATE TABLE IF NOT EXISTS public.resume (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_url text NOT NULL,
  file_name text NOT NULL,
  uploaded_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.resume ENABLE ROW LEVEL SECURITY;

-- Anyone can view resume
CREATE POLICY "Anyone can view resume"
  ON public.resume
  FOR SELECT
  USING (true);

-- Admins can manage resume
CREATE POLICY "Admins can manage resume"
  ON public.resume
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));