-- Public bucket direct-URL access (getPublicUrl) does NOT require a SELECT policy --
-- storage.buckets.public = true already serves objects via /storage/v1/object/public/...
-- without going through RLS. The broad "true" SELECT policy below only served to allow
-- anon clients to call list()/download() via the Storage API, which let them enumerate
-- every file path in the bucket. Dropping it removes enumeration while public URLs
-- (what the app actually uses to render images) keep working unaffected.

DROP POLICY IF EXISTS "Lineup assets are publicly readable" ON storage.objects;

CREATE POLICY "Users can list their own lineup assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'lineup-assets' AND auth.uid()::text = (storage.foldername(name))[1]);