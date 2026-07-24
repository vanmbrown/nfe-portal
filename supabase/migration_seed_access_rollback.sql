-- Rollback for migration_seed_access.sql. PROPOSAL ONLY, not applied.
-- Drops in dependency order (children before parents).

DROP TABLE IF EXISTS public.seed_events;
DROP TABLE IF EXISTS public.seed_checkins;
DROP TABLE IF EXISTS public.seed_permissions;
DROP TABLE IF EXISTS public.seed_participants;
DROP TABLE IF EXISTS public.seed_invitations;
