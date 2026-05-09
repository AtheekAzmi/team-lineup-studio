
ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS bg_image_url text,
  ADD COLUMN IF NOT EXISTS bg_image_opacity numeric NOT NULL DEFAULT 0.6,
  ADD COLUMN IF NOT EXISTS team_a_logo_url text,
  ADD COLUMN IF NOT EXISTS team_a_logo_scale numeric NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS team_a_logo_x numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS team_a_logo_y numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS team_b_logo_url text,
  ADD COLUMN IF NOT EXISTS team_b_logo_scale numeric NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS team_b_logo_x numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS team_b_logo_y numeric NOT NULL DEFAULT 0;

INSERT INTO storage.buckets (id, name, public)
VALUES ('lineup-assets', 'lineup-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Lineup assets are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'lineup-assets');

CREATE POLICY "Users can upload to their own lineup folder"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'lineup-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own lineup assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'lineup-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own lineup assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'lineup-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
