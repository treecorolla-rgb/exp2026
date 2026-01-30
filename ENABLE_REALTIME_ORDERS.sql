-- Enable Realtime for the ORDERS table
-- This allows the Admin Dashboard to receive instant updates when a new order is placed.

begin;
  -- Add the 'orders' table to the 'supabase_realtime' publication
  -- This is the critical step to enable server-side broadcasting
  alter publication supabase_realtime add table public.orders;
commit;

-- Verification (Optional):
-- select * from pg_publication_tables where pubname = 'supabase_realtime';
