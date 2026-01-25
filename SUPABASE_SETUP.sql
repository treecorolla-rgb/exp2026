-- 1. Categories Table
create table public.categories (
  id text primary key,
  name text not null,
  slug text not null,
  enabled boolean default true
);

-- 2. Products Table
create table public.products (
  id text primary key,
  name text not null,
  active_ingredient text,
  price numeric,
  image text,
  category_ids text[], -- Array of strings
  is_popular boolean default false,
  enabled boolean default true,
  other_names text[],
  description text,
  packages jsonb, -- Stores the packages array
  delivery_options jsonb -- Stores specific delivery options
);

-- 3. Store Settings (Admin Profile & Logo)
create table public.store_settings (
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

-- 4. Payment Methods
create table public.payment_methods (
  id text primary key,
  name text not null,
  icon_url text,
  enabled boolean default true
);

-- 5. Delivery Options (Global)
create table public.delivery_options (
  id text primary key,
  name text not null,
  price numeric,
  min_days int,
  max_days int,
  icon text,
  enabled boolean default true
);

-- 6. Orders
create table public.orders (
  id text primary key,
  customer_name text,
  total numeric,
  status text,
  date text, -- Storing as ISO string or formatted string
  details jsonb -- Customer details object
);

-- Enable Row Level Security (Optional: Open access for this demo)
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.store_settings enable row level security;
alter table public.payment_methods enable row level security;
alter table public.delivery_options enable row level security;
alter table public.orders enable row level security;

-- Create policies to allow public read/write (For demo purposes only)
create policy "Public Access Categories" on public.categories for all using (true) with check (true);
create policy "Public Access Products" on public.products for all using (true) with check (true);
create policy "Public Access Settings" on public.store_settings for all using (true) with check (true);
create policy "Public Access Payments" on public.payment_methods for all using (true) with check (true);
create policy "Public Access Delivery" on public.delivery_options for all using (true) with check (true);
create policy "Public Access Orders" on public.orders for all using (true) with check (true);

-- Insert Default Settings Row
insert into public.store_settings (id, email, us_phone_number, uk_phone_number, show_floating_chat)
values (1, 'admin@example.com', '+1 (888) 243-74-06', '+44 (800) 041-87-44', true)
on conflict (id) do nothing;
