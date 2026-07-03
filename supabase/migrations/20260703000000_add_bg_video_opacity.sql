ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS bg_video_opacity numeric NOT NULL DEFAULT 0.6;
