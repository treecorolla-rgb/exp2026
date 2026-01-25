
-- 1. Store Settings (For your Logo, Phone Numbers, Chat IDs)
create table if not exists public.store_settings (
  id int primary key default 1, -- Singleton row
  email text,
  telegram_bot_token text,
  telegram_chat_id text,
  receive_email_notifications boolean,
  receive_telegram_notifications boolean,
  us_phone_number text,
  uk_phone_number text,
  whatsapp_number text,
  telegram_username text,
  show_floating_chat boolean,
  logo_url text
);

-- 2. Payment Methods (For footer and checkout icons)
create table if not exists public.payment_methods (
  id text primary key,
  name text not null,
  icon_url text,
  enabled boolean default true
);

-- 3. Delivery Options (For product details page)
create table if not exists public.delivery_options (
  id text primary key,
  name text not null,
  price numeric,
  min_days int,
  max_days int,
  icon text,
  enabled boolean default true
);

-- 4. Ensure Storage Bucket Exists (Safe Insert)
insert into storage.buckets (id, name, public) 
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 5. Enable Row Level Security (Safety)
alter table public.store_settings enable row level security;
alter table public.payment_methods enable row level security;
alter table public.delivery_options enable row level security;

-- 6. Create Public Access Policies (So your site can read them)
drop policy if exists "Public Access Settings" on public.store_settings;
create policy "Public Access Settings" on public.store_settings for all using (true) with check (true);

drop policy if exists "Public Access Payments" on public.payment_methods;
create policy "Public Access Payments" on public.payment_methods for all using (true) with check (true);

drop policy if exists "Public Access Delivery" on public.delivery_options;
create policy "Public Access Delivery" on public.delivery_options for all using (true) with check (true);

drop policy if exists "Public Access Images" on storage.objects;
create policy "Public Access Images" on storage.objects for all using ( bucket_id = 'product-images' );

-- 7. Insert Default Settings (If table is empty)
insert into public.store_settings (id, email, us_phone_number, uk_phone_number, show_floating_chat)
values (1, 'admin@example.com', '+1 (888) 243-74-06', '+44 (800) 041-87-44', true)
on conflict (id) do nothing;
