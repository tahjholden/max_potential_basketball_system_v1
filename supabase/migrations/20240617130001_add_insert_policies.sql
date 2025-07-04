-- Migration: Add insert policies for authenticated users (2024-06-17)

-- Players table: Allow authenticated users to insert players
create policy "Allow authenticated users to insert players"
on public.players
for insert
to authenticated
with check (true);

-- Observations table: Enable RLS and add policies
alter table public.observations enable row level security;

create policy "Allow authenticated users to read observations"
on public.observations
for select
to authenticated
using (true);

create policy "Allow authenticated users to insert observations"
on public.observations
for insert
to authenticated
with check (true);

-- PDP table: Enable RLS and add policies
alter table public.pdp enable row level security;

create policy "Allow authenticated users to read pdp"
on public.pdp
for select
to authenticated
using (true);

create policy "Allow authenticated users to insert pdp"
on public.pdp
for insert
to authenticated
with check (true);

create policy "Allow authenticated users to update pdp"
on public.pdp
for update
to authenticated
using (true)
with check (true);

-- Coaches table: Enable RLS and add policies
alter table public.coaches enable row level security;

create policy "Allow authenticated users to read coaches"
on public.coaches
for select
to authenticated
using (true);

-- Activity log table: Enable RLS and add policies
alter table public.activity_log enable row level security;

create policy "Allow authenticated users to read activity_log"
on public.activity_log
for select
to authenticated
using (true);

create policy "Allow authenticated users to insert activity_log"
on public.activity_log
for insert
to authenticated
with check (true); 