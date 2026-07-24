-- Seed Access (customer-facing: "The NFE Study Circle") — Phase 1 schema.
-- PROPOSAL ONLY. Not applied to any environment as part of this change.
-- See docs/seed-access/BACKEND_PROPOSAL.md for the API contract this
-- schema supports and docs/seed-access/migration_seed_access_rollback.sql
-- for the corresponding rollback.

CREATE TABLE IF NOT EXISTS public.seed_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token_hash TEXT NOT NULL,
    email TEXT NOT NULL,
    participant_name TEXT,
    source TEXT,
    status TEXT NOT NULL DEFAULT 'issued'
        CHECK (status IN ('issued', 'redeemed', 'expired', 'revoked')),
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    redeemed_at TIMESTAMPTZ,
    created_by TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS seed_invitations_token_hash_unique
ON public.seed_invitations (token_hash);

CREATE INDEX IF NOT EXISTS seed_invitations_email_idx
ON public.seed_invitations (LOWER(email));

ALTER TABLE public.seed_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do everything on seed_invitations"
ON public.seed_invitations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- No anon/authenticated policy is defined. With RLS enabled and no such
-- policy, anon and authenticated roles have zero access by default. Only
-- the server-side admin (service_role) client — the same pattern already
-- used by founder_access_signups — can read or write this table.
--
-- Redemption (see BACKEND_PROPOSAL.md §2) must use a single conditional
-- UPDATE (`WHERE status = 'issued' AND expires_at > now()`), never a
-- read-then-write from application code — that is what makes single-use
-- safe under concurrent requests.


CREATE TABLE IF NOT EXISTS public.seed_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invitation_id UUID NOT NULL REFERENCES public.seed_invitations(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    age_range TEXT,
    skin_type TEXT,
    primary_concerns TEXT[] DEFAULT '{}',
    current_routine TEXT,
    sensitivities TEXT,
    fragrance_sensitive BOOLEAN NOT NULL DEFAULT false,
    preferred_contact_method TEXT,
    additional_context TEXT,
    product_assignment TEXT
        CHECK (product_assignment IN ('face_elixir', 'body_elixir')),
    willing_to_use_as_directed BOOLEAN NOT NULL DEFAULT false,
    willing_to_complete_checkins BOOLEAN NOT NULL DEFAULT false,
    participation_status TEXT NOT NULL DEFAULT 'intake_complete'
        CHECK (participation_status IN (
            'intake_complete', 'product_shipped', 'in_progress',
            'completed', 'withdrawn'
        )),
    consent_version TEXT NOT NULL,
    privacy_consent_at TIMESTAMPTZ NOT NULL,
    participation_consent_at TIMESTAMPTZ NOT NULL,
    marketing_consent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS seed_participants_invitation_unique
ON public.seed_participants (invitation_id);

CREATE INDEX IF NOT EXISTS seed_participants_email_idx
ON public.seed_participants (LOWER(email));

ALTER TABLE public.seed_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do everything on seed_participants"
ON public.seed_participants
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


CREATE TABLE IF NOT EXISTS public.seed_permissions (
    participant_id UUID PRIMARY KEY
        REFERENCES public.seed_participants(id),
    quote_permission BOOLEAN NOT NULL DEFAULT false,
    quote_edit_permission BOOLEAN NOT NULL DEFAULT false,
    first_name_permission BOOLEAN NOT NULL DEFAULT false,
    full_name_permission BOOLEAN NOT NULL DEFAULT false,
    photo_permission BOOLEAN NOT NULL DEFAULT false,
    video_permission BOOLEAN NOT NULL DEFAULT false,
    website_permission BOOLEAN NOT NULL DEFAULT false,
    email_permission BOOLEAN NOT NULL DEFAULT false,
    organic_social_permission BOOLEAN NOT NULL DEFAULT false,
    paid_media_permission BOOLEAN NOT NULL DEFAULT false,
    future_contact_permission BOOLEAN NOT NULL DEFAULT false,
    permission_recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    permission_version TEXT NOT NULL
);

ALTER TABLE public.seed_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do everything on seed_permissions"
ON public.seed_permissions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


CREATE TABLE IF NOT EXISTS public.seed_checkins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES public.seed_participants(id),
    checkin_type TEXT NOT NULL
        CHECK (checkin_type IN ('first_use', '7_10_day', '3_4_week')),
    scheduled_for TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'submitted', 'skipped')),
    first_impression TEXT,
    texture_feedback TEXT,
    absorption_feedback TEXT,
    immediate_skin_feel TEXT,
    later_day_skin_feel TEXT,
    dryness_feedback TEXT,
    comfort_feedback TEXT,
    visible_observations TEXT,
    dislikes TEXT,
    routine_changes TEXT,
    expected_price NUMERIC,
    purchase_intent TEXT,
    repurchase_intent TEXT,
    freeform_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS seed_checkins_participant_idx
ON public.seed_checkins (participant_id);

CREATE UNIQUE INDEX IF NOT EXISTS seed_checkins_participant_type_unique
ON public.seed_checkins (participant_id, checkin_type);

ALTER TABLE public.seed_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do everything on seed_checkins"
ON public.seed_checkins
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


CREATE TABLE IF NOT EXISTS public.seed_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID REFERENCES public.seed_participants(id),
    invitation_id UUID REFERENCES public.seed_invitations(id),
    event_type TEXT NOT NULL,
    source TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS seed_events_participant_idx
ON public.seed_events (participant_id);

CREATE INDEX IF NOT EXISTS seed_events_invitation_idx
ON public.seed_events (invitation_id);

ALTER TABLE public.seed_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do everything on seed_events"
ON public.seed_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
