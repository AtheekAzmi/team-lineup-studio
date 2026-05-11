ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_matches_user_sort ON public.matches(user_id, sort_order);
UPDATE public.matches m SET sort_order = sub.rn FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC) AS rn FROM public.matches
) sub WHERE m.id = sub.id AND m.sort_order = 0;