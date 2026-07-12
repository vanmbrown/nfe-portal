-- Founder Access signups: operational source of truth for Phase 1 capture
CREATE TABLE IF NOT EXISTS public.founder_access_signups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT,
    phone TEXT,
    age_range TEXT,
    primary_skin_interests TEXT[] DEFAULT '{}',
    product_interest TEXT,
    topic_request TEXT,
    newsletter_opt_in BOOLEAN NOT NULL DEFAULT false,
    privacy_policy_accepted BOOLEAN NOT NULL DEFAULT false,
    consent_text_version TEXT,
    consented_at TIMESTAMPTZ,
    source_page TEXT DEFAULT '/founder-access',
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    referrer TEXT,
    landing_page TEXT,
    high_intent BOOLEAN NOT NULL DEFAULT false,
    beehiiv_status TEXT,
    beehiiv_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS founder_access_signups_email_unique
ON public.founder_access_signups (LOWER(email));

ALTER TABLE public.founder_access_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do everything on founder_access_signups"
ON public.founder_access_signups
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
