-- Rollback for migration_seed_access.sql.
-- NON-PRODUCTION ONLY. Never run against production.
--
-- Drops in dependency order: the function first (it references the tables),
-- then children before parents.

DROP FUNCTION IF EXISTS public.seed_access_redeem_invitation(TEXT, TEXT, JSONB);

DROP TABLE IF EXISTS public.seed_events;
DROP TABLE IF EXISTS public.seed_checkins;
DROP TABLE IF EXISTS public.seed_permissions;
DROP TABLE IF EXISTS public.seed_participants;
DROP TABLE IF EXISTS public.seed_invitations;
