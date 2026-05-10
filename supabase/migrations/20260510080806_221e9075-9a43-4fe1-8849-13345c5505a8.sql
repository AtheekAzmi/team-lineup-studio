ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS title_color text NOT NULL DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS title_font text NOT NULL DEFAULT 'system-ui, sans-serif',
  ADD COLUMN IF NOT EXISTS title_size numeric NOT NULL DEFAULT 44,
  ADD COLUMN IF NOT EXISTS subtitle_color text NOT NULL DEFAULT '#e5e7eb',
  ADD COLUMN IF NOT EXISTS player_text_color text NOT NULL DEFAULT '#1a1a1a';