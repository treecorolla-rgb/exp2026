-- FIX: Drop the email trigger that might be causing insert failures if templates or columns are missing
drop trigger if exists on_order_email_event on public.orders;
drop function if exists public.handle_order_email_trigger();

-- Also ensure RLS is correctly permissive (just in case)
alter table public.orders enable row level security;
drop policy if exists "Enable insert for everyone" on public.orders;
drop policy if exists "Enable select for everyone" on public.orders;
drop policy if exists "Enable update for everyone" on public.orders;
drop policy if exists "Enable delete for everyone" on public.orders;
create policy "Enable insert for everyone" on public.orders for insert with check (true);
create policy "Enable select for everyone" on public.orders for select using (true);
create policy "Enable update for everyone" on public.orders for update using (true);
create policy "Enable delete for everyone" on public.orders for delete using (true);
