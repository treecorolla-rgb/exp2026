-- FIX FORCE: Drop trigger function and cascade dependencies to clear blockers
drop function if exists public.handle_order_email_trigger() cascade;

-- Re-apply RLS policies just to be 100% sure the table is open for business
alter table public.orders enable row level security;
drop policy if exists "Enable insert for everyone" on public.orders;
drop policy if exists "Enable select for everyone" on public.orders;
create policy "Enable insert for everyone" on public.orders for insert with check (true);
create policy "Enable select for everyone" on public.orders for select using (true);
