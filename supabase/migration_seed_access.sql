-- Seed Access (customer-facing: "The NFE Study Circle") — schema.
--
-- PROPOSAL / NON-PRODUCTION ONLY. This file has NOT been applied to any
-- environment. Apply it to a local Supabase instance or an explicitly
-- identified non-production project only. See
-- docs/seed-access/NON_PRODUCTION_OPERATIONS.md.
--
-- Rollback: supabase/migration_seed_access_rollback.sql

-- =====================================================================
-- Invitations
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.seed_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    -- SHA-256 hex of the raw token. The raw token is never stored anywhere.
    token_hash TEXT NOT NULL,
    -- Stored already-normalised (lower-cased) by the issuing CLI.
    email TEXT NOT NULL,
    participant_name TEXT,
    -- NFE assigns the product before the invitation is sent (policy §2).
    product_assignment TEXT NOT NULL
        CHECK (product_assignment IN ('face_elixir', 'body_elixir')),
    source TEXT NOT NULL DEFAULT 'founder_invitation'
        CHECK (source IN (
            'vanessa_linkedin', 'nfe_linkedin', 'instagram', 'friend_referral',
            'creator_referral', 'email', 'event', 'direct', 'existing_user',
            'founder_invitation'
        )),
    status TEXT NOT NULL DEFAULT 'issued'
        CHECK (status IN ('issued', 'redeemed', 'expired', 'revoked', 'declined')),
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    redeemed_at TIMESTAMPTZ,
    declined_at TIMESTAMPTZ,
    created_by TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS seed_invitations_token_hash_unique
ON public.seed_invitations (token_hash);

CREATE INDEX IF NOT EXISTS seed_invitations_email_idx
ON public.seed_invitations (LOWER(email));

ALTER TABLE public.seed_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do everything on seed_invitations"
ON public.seed_invitations FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- No anon/authenticated policy exists on any table in this file. With RLS
-- enabled and no such policy, those roles have zero access by default. All
-- access is through server-side Route Handlers using the service-role client.

-- =====================================================================
-- Participants
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.seed_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invitation_id UUID NOT NULL REFERENCES public.seed_invitations(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    age_range TEXT,
    skin_type TEXT,
    primary_concerns TEXT[] NOT NULL DEFAULT '{}',
    current_routine TEXT,
    -- Self-reported cosmetic context only. Never a diagnosis, never a medical
    -- record. Treated as the most sensitive field in this schema.
    sensitivities TEXT,
    fragrance_sensitive BOOLEAN NOT NULL DEFAULT false,
    preferred_contact_method TEXT,
    location TEXT,
    additional_context TEXT,
    -- Copied from the invitation at redemption. Never accepted from a client.
    product_assignment TEXT NOT NULL
        CHECK (product_assignment IN ('face_elixir', 'body_elixir')),
    willing_to_use_as_directed BOOLEAN NOT NULL DEFAULT false,
    willing_to_complete_checkins BOOLEAN NOT NULL DEFAULT false,
    participation_status TEXT NOT NULL DEFAULT 'intake_complete'
        CHECK (participation_status IN (
            'intake_complete', 'product_shipped', 'in_progress',
            'completed', 'withdrawn'
        )),

    -- Six distinct required commitments are presented to the participant, so
    -- six distinct timestamps are stored. Collapsing them into one would lose
    -- the record of what was actually agreed to.
    consent_version TEXT NOT NULL,
    participation_consent_at TIMESTAMPTZ NOT NULL,
    privacy_consent_at TIMESTAMPTZ NOT NULL,
    study_contact_consent_at TIMESTAMPTZ NOT NULL,
    honest_feedback_consent_at TIMESTAMPTZ NOT NULL,
    internal_learning_consent_at TIMESTAMPTZ NOT NULL,
    confidentiality_acknowledged_at TIMESTAMPTZ NOT NULL,
    confidentiality_version TEXT NOT NULL,
    -- Optional and separate. NULL means "not opted in", never "unknown".
    marketing_consent_at TIMESTAMPTZ,

    -- Retention / lifecycle (policy §12).
    completed_at TIMESTAMPTZ,
    withdrawn_at TIMESTAMPTZ,
    withdrawal_reason TEXT,
    anonymized_at TIMESTAMPTZ,
    deletion_requested_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    retention_review_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One participant per invitation. This is the second layer of duplicate
-- protection, independent of the conditional UPDATE in the redeem function.
CREATE UNIQUE INDEX IF NOT EXISTS seed_participants_invitation_unique
ON public.seed_participants (invitation_id);

CREATE INDEX IF NOT EXISTS seed_participants_email_idx
ON public.seed_participants (LOWER(email));

ALTER TABLE public.seed_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do everything on seed_participants"
ON public.seed_participants FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- =====================================================================
-- Permissions (each independently granted; all default false)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.seed_permissions (
    participant_id UUID PRIMARY KEY REFERENCES public.seed_participants(id),
    quote_permission BOOLEAN NOT NULL DEFAULT false,
    -- Bounded to length. Materially edited quotes require separate participant
    -- approval before publication — an operational step, not an automated one.
    quote_length_edit_permission BOOLEAN NOT NULL DEFAULT false,
    first_name_permission BOOLEAN NOT NULL DEFAULT false,
    full_name_permission BOOLEAN NOT NULL DEFAULT false,
    photo_permission BOOLEAN NOT NULL DEFAULT false,
    video_permission BOOLEAN NOT NULL DEFAULT false,
    website_permission BOOLEAN NOT NULL DEFAULT false,
    email_permission BOOLEAN NOT NULL DEFAULT false,
    organic_social_permission BOOLEAN NOT NULL DEFAULT false,
    paid_media_permission BOOLEAN NOT NULL DEFAULT false,
    future_contact_permission BOOLEAN NOT NULL DEFAULT false,
    -- The boolean choice; seed_participants.marketing_consent_at records when.
    marketing_permission BOOLEAN NOT NULL DEFAULT false,
    permission_recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    permission_version TEXT NOT NULL,
    permissions_withdrawn_at TIMESTAMPTZ
);

ALTER TABLE public.seed_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do everything on seed_permissions"
ON public.seed_permissions FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- =====================================================================
-- Check-ins (schema only this phase; no participant-facing UI yet)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.seed_checkins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES public.seed_participants(id),
    checkin_type TEXT NOT NULL
        CHECK (checkin_type IN ('first_use', '7_10_day', '3_4_week')),
    scheduled_for TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'submitted', 'skipped')),
    reminders_sent SMALLINT NOT NULL DEFAULT 0 CHECK (reminders_sent <= 2),
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS seed_checkins_participant_idx
ON public.seed_checkins (participant_id);

CREATE UNIQUE INDEX IF NOT EXISTS seed_checkins_participant_type_unique
ON public.seed_checkins (participant_id, checkin_type);

ALTER TABLE public.seed_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do everything on seed_checkins"
ON public.seed_checkins FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- =====================================================================
-- Audit events (non-PII operational record)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.seed_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID REFERENCES public.seed_participants(id),
    invitation_id UUID REFERENCES public.seed_invitations(id),
    event_type TEXT NOT NULL,
    source TEXT,
    -- Enums, booleans, counts, timestamps, and internal IDs only. Application
    -- code asserts this before every write (src/lib/seed-access/auditEvents.ts).
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS seed_events_participant_idx
ON public.seed_events (participant_id);

CREATE INDEX IF NOT EXISTS seed_events_invitation_idx
ON public.seed_events (invitation_id);

ALTER TABLE public.seed_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do everything on seed_events"
ON public.seed_events FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- =====================================================================
-- Atomic redemption
-- =====================================================================
-- Claiming the invitation, creating the participant, and creating the
-- permissions row happen in ONE transaction. A sequence of client-side calls
-- could not provide this: two concurrent submissions could both read an
-- 'issued' invitation before either wrote.
--
-- The concurrency guard is the conditional UPDATE below. Only one transaction
-- can move a row from 'issued' to 'redeemed'; the loser sees zero rows
-- updated and returns 'invitation_unavailable'. Any later failure (including
-- the unique index on invitation_id) raises, which rolls the claim back — so
-- a failed intake never silently burns an invitation.
CREATE OR REPLACE FUNCTION public.seed_access_redeem_invitation(
    p_token_hash TEXT,
    p_email TEXT,
    p_intake JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_invitation public.seed_invitations%ROWTYPE;
    v_participant_id UUID;
    v_now TIMESTAMPTZ := NOW();
BEGIN
    -- Email binding is checked first so a mismatch does not consume the
    -- invitation. The participant simply sees the same generic failure.
    SELECT * INTO v_invitation
      FROM public.seed_invitations
     WHERE token_hash = p_token_hash;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'reason', 'invitation_unavailable');
    END IF;

    IF LOWER(v_invitation.email) IS DISTINCT FROM LOWER(p_email) THEN
        RETURN jsonb_build_object('ok', false, 'reason', 'email_mismatch');
    END IF;

    -- The atomic claim. Expiry is evaluated here, so an 'issued' row that has
    -- simply aged out is rejected without needing a scheduled sweep first.
    UPDATE public.seed_invitations
       SET status = 'redeemed',
           redeemed_at = v_now,
           updated_at = v_now
     WHERE token_hash = p_token_hash
       AND status = 'issued'
       AND redeemed_at IS NULL
       AND expires_at > v_now
    RETURNING * INTO v_invitation;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'reason', 'invitation_unavailable');
    END IF;

    INSERT INTO public.seed_participants (
        invitation_id, first_name, last_name, email, phone, age_range,
        skin_type, primary_concerns, current_routine, sensitivities,
        fragrance_sensitive, preferred_contact_method, location,
        additional_context, product_assignment,
        willing_to_use_as_directed, willing_to_complete_checkins,
        consent_version,
        participation_consent_at, privacy_consent_at, study_contact_consent_at,
        honest_feedback_consent_at, internal_learning_consent_at,
        confidentiality_acknowledged_at, confidentiality_version,
        marketing_consent_at
    ) VALUES (
        v_invitation.id,
        p_intake ->> 'firstName',
        p_intake ->> 'lastName',
        LOWER(p_intake ->> 'email'),
        p_intake ->> 'phone',
        p_intake ->> 'ageRange',
        p_intake ->> 'skinType',
        COALESCE(
            ARRAY(SELECT jsonb_array_elements_text(p_intake -> 'primaryConcerns')),
            '{}'
        ),
        p_intake ->> 'currentRoutine',
        p_intake ->> 'sensitivities',
        COALESCE((p_intake ->> 'fragranceSensitive')::BOOLEAN, false),
        p_intake ->> 'preferredContactMethod',
        p_intake ->> 'location',
        p_intake ->> 'additionalContext',
        -- Derived from the invitation, never from the payload.
        v_invitation.product_assignment,
        COALESCE((p_intake ->> 'willingToUseAsDirected')::BOOLEAN, false),
        COALESCE((p_intake ->> 'willingToCompleteCheckins')::BOOLEAN, false),
        p_intake ->> 'consentVersion',
        -- All six consent timestamps are generated server-side, here. A
        -- browser-supplied timestamp is never trusted or read.
        v_now, v_now, v_now, v_now, v_now, v_now,
        p_intake ->> 'confidentialityVersion',
        CASE WHEN COALESCE((p_intake ->> 'marketingOptIn')::BOOLEAN, false)
             THEN v_now ELSE NULL END
    )
    RETURNING id INTO v_participant_id;

    INSERT INTO public.seed_permissions (
        participant_id,
        quote_permission, quote_length_edit_permission,
        first_name_permission, full_name_permission,
        photo_permission, video_permission,
        website_permission, email_permission,
        organic_social_permission, paid_media_permission,
        future_contact_permission, marketing_permission,
        permission_recorded_at, permission_version
    ) VALUES (
        v_participant_id,
        COALESCE((p_intake -> 'permissions' ->> 'quotePermission')::BOOLEAN, false),
        COALESCE((p_intake -> 'permissions' ->> 'quoteLengthEditPermission')::BOOLEAN, false),
        COALESCE((p_intake -> 'permissions' ->> 'firstNamePermission')::BOOLEAN, false),
        COALESCE((p_intake -> 'permissions' ->> 'fullNamePermission')::BOOLEAN, false),
        COALESCE((p_intake -> 'permissions' ->> 'photoPermission')::BOOLEAN, false),
        COALESCE((p_intake -> 'permissions' ->> 'videoPermission')::BOOLEAN, false),
        COALESCE((p_intake -> 'permissions' ->> 'websitePermission')::BOOLEAN, false),
        COALESCE((p_intake -> 'permissions' ->> 'emailPermission')::BOOLEAN, false),
        COALESCE((p_intake -> 'permissions' ->> 'organicSocialPermission')::BOOLEAN, false),
        COALESCE((p_intake -> 'permissions' ->> 'paidMediaPermission')::BOOLEAN, false),
        COALESCE((p_intake -> 'permissions' ->> 'futureContactPermission')::BOOLEAN, false),
        COALESCE((p_intake -> 'permissions' ->> 'marketingPermission')::BOOLEAN, false),
        v_now,
        p_intake ->> 'permissionVersion'
    );

    INSERT INTO public.seed_events (participant_id, invitation_id, event_type, source, metadata)
    VALUES (
        v_participant_id, v_invitation.id, 'invitation_redeemed', v_invitation.source,
        jsonb_build_object('product', v_invitation.product_assignment)
    );

    RETURN jsonb_build_object(
        'ok', true,
        'participant_id', v_participant_id,
        'invitation_id', v_invitation.id,
        'product_assignment', v_invitation.product_assignment,
        'source', v_invitation.source
    );
END;
$$;

-- SECURITY DEFINER means this function runs with the owner's rights, so it
-- must never be callable by an untrusted role.
REVOKE ALL ON FUNCTION public.seed_access_redeem_invitation(TEXT, TEXT, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.seed_access_redeem_invitation(TEXT, TEXT, JSONB) FROM anon;
REVOKE ALL ON FUNCTION public.seed_access_redeem_invitation(TEXT, TEXT, JSONB) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.seed_access_redeem_invitation(TEXT, TEXT, JSONB) TO service_role;
