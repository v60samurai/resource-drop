# Resource Drop

A minimal link-sharing app for teams and communities. Drop a link, tag it, and it shows up in the feed. No auth, no fluff.

## Tech Stack

- **Next.js 16** (App Router)
- **Supabase** (PostgreSQL)
- **Tailwind CSS 4**
- **TypeScript**

## Setup

### 1. Clone and install

```bash
pnpm install
```

### 2. Create Supabase table

Run this SQL in your Supabase SQL Editor:

```sql
create table resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  tag text not null,
  submitted_by text not null,
  created_at timestamptz default now()
);
```

### 3. Configure RLS (Row Level Security)

**Option A: Disable RLS** (simplest for public apps)

```sql
alter table resources disable row level security;
```

**Option B: Enable public read/insert policies**

```sql
-- Enable RLS
alter table resources enable row level security;

-- Allow anyone to read
create policy "Public read" on resources for select using (true);

-- Allow anyone to insert
create policy "Public insert" on resources for insert with check (true);
```

### 4. Set environment variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- Submit resources with title, URL, tag, and your name
- Filter by tag (Design, Product, Tech, Career, General)
- Optimistic UI for instant feedback
- Relative timestamps
- Mobile-friendly dark theme

## License

MIT
