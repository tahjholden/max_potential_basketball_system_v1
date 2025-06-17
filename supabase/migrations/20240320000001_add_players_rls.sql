-- Enable RLS on players table if not already enabled
alter table public.players enable row level security;

-- Create policy to allow authenticated users to read players
create policy "Allow authenticated users to read players"
on public.players
for select
to authenticated
using (true); 