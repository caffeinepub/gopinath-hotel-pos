-- Run this in your Supabase SQL Editor to create the required tables

-- Users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null check (role in ('owner', 'staff')),
  pin text not null,
  created_at timestamptz default now()
);

-- Menu Items
create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null,
  category text not null,
  available boolean default true,
  image_url text,
  created_at timestamptz default now()
);

-- Orders
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  items jsonb not null,
  total numeric not null,
  payment_mode text not null,
  payment_status text not null default 'pending',
  created_at timestamptz default now()
);

-- Payments
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  amount numeric not null,
  status text not null,
  transaction_id text,
  created_at timestamptz default now()
);

-- Analytics (optional, computed view)
create table if not exists analytics (
  id uuid primary key default gen_random_uuid(),
  total_sales numeric default 0,
  total_orders int default 0,
  top_item text default '',
  date date default current_date
);

-- Enable RLS (Row Level Security) - for public anon access during dev
alter table menu_items enable row level security;
alter table orders enable row level security;
alter table payments enable row level security;

-- Allow anon read/write for development (tighten in production)
create policy "anon_all_menu_items" on menu_items for all using (true) with check (true);
create policy "anon_all_orders" on orders for all using (true) with check (true);
create policy "anon_all_payments" on payments for all using (true) with check (true);

-- Enable realtime on orders
alter publication supabase_realtime add table orders;
