-- ----
-- PDP
-- ----

-- 1. Allow authenticated users to read all PDPs
CREATE POLICY "Allow authenticated users to read all pdps"
ON public.pdp
FOR SELECT
TO authenticated
USING (true);

-- 2. Allow coaches to update PDPs they are assigned to
CREATE POLICY "Allow coaches to update their own pdps"
ON public.pdp
FOR UPDATE
TO authenticated
USING ((SELECT auth_uid FROM public.coaches WHERE id = pdp.coach_id) = auth.uid())
WITH CHECK ((SELECT auth_uid FROM public.coaches WHERE id = pdp.coach_id) = auth.uid());

-- ---------
-- OBSERVATIONS
-- ---------

-- 1. Allow authenticated users to read all observations
CREATE POLICY "Allow authenticated users to read all observations"
ON public.observations
FOR SELECT
TO authenticated
USING (true);

-- 2. Allow coaches to update observations they have created
CREATE POLICY "Allow coaches to update their own observations"
ON public.observations
FOR UPDATE
TO authenticated
USING ((SELECT auth_uid FROM public.coaches WHERE id = observations.coach_id) = auth.uid())
WITH CHECK ((SELECT auth_uid FROM public.coaches WHERE id = observations.coach_id) = auth.uid()); 