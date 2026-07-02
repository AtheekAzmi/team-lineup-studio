
ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS bg_video_url text,
  ADD COLUMN IF NOT EXISTS brand_left_scale numeric NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS brand_left_x numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS brand_left_y numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS brand_right_scale numeric NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS brand_right_x numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS brand_right_y numeric NOT NULL DEFAULT 0;
