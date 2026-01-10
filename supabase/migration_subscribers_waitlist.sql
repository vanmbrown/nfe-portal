-- Create subscribers table
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    source TEXT DEFAULT 'website'
);

-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    product TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(email, product)
);

-- Create community_input table
CREATE TABLE IF NOT EXISTS public.community_input (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT,
    email TEXT,
    age_range TEXT,
    skin_description TEXT,
    concerns TEXT[],
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_input ENABLE ROW LEVEL SECURITY;

-- Create policies for Service Role (Admin) access
-- The service role key bypasses RLS by default, but explicit policies are good practice.
-- We do NOT want these tables publicly readable/writable via client-side libraries.

-- Subscribers: Only service role can insert/select
CREATE POLICY "Service role can do everything on subscribers"
ON public.subscribers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Waitlist: Only service role can insert/select
CREATE POLICY "Service role can do everything on waitlist"
ON public.waitlist
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Community Input: Only service role can insert/select
CREATE POLICY "Service role can do everything on community_input"
ON public.community_input
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

