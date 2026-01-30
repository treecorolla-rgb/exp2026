-- FIX: Enable Insert/Select for public (anon) users on orders table
alter table public.orders enable row level security;

-- Policy to allow anonymous users to Insert new orders
create policy "Enable insert for everyone" on public.orders for insert with check (true);

-- Policy to allow anonymous users (AdminDashboard) to Select orders
create policy "Enable select for everyone" on public.orders for select using (true);

-- Policy to allow anonymous users to Update orders (for admin status updates)
create policy "Enable update for everyone" on public.orders for update using (true);

-- Policy to allow anonymous users to Delete orders
create policy "Enable delete for everyone" on public.orders for delete using (true);

-- Also ensure 'email_logs' and other tables are accessible if needed
alter table public.email_logs enable row level security;
create policy "Enable insert for logs" on public.email_logs for insert with check (true);
create policy "Enable select for logs" on public.email_logs for select using (true);
