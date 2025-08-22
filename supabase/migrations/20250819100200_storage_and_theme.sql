-- Enable storage bucket for avatars (requires supabase/storage configured)
-- Create bucket avatars if not exists
-- Note: If using Supabase Storage via Studio, create a public bucket named 'avatars'

-- Add theme preference to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme TEXT CHECK (theme IN ('light','dark'));


