-- FIX RLS V2: Drop existing policies first to avoid "already exists" errors
-- Then re-create them to ensure they are correct.

-- 1. Enable RLS (idempotent, harmless if already enabled)
alter table public.orders enable row level security;

-- 2. Drop existing policies to start fresh
drop policy if exists "Enable insert for everyone" on public.orders;
drop policy if exists "Enable select for everyone" on public.orders;
drop policy if exists "Enable update for everyone" on public.orders;
drop policy if exists "Enable delete for everyone" on public.orders;

-- 3. Create permissive policies for all operations
create policy "Enable insert for everyone" on public.orders for insert with check (true);
create policy "Enable select for everyone" on public.orders for select using (true);
create policy "Enable update for everyone" on public.orders for update using (true);
create policy "Enable delete for everyone" on public.orders for delete using (true);

-- 4. Do the same for email_logs to be safe
alter table public.email_logs enable row level security;
drop policy if exists "Enable insert for logs" on public.email_logs;
drop policy if exists "Enable select for logs" on public.email_logs;

create policy "Enable insert for logs" on public.email_logs for insert with check (true);
create policy "Enable select for logs" on public.email_logs for select using (true);
