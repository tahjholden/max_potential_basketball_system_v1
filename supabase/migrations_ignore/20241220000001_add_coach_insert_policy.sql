-- Migration: Add insert policy for coaches table (2024-12-20)
-- This allows authenticated users to create coach records during signup

create policy "Allow authenticated users to insert coaches"
on public.coaches
for insert
to authenticated
with check (true); 