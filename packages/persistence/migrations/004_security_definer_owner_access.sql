-- These tables are accessed by narrowly granted SECURITY DEFINER functions
-- before a tenant context exists or across tenants. The deployment role owns
-- the tables and functions; the separate runtime role remains subject to RLS.
-- FORCE would also apply RLS to a non-superuser owner and make those functions
-- depend accidentally on a superuser/BYPASSRLS deployment account.

ALTER TABLE app.businesses NO FORCE ROW LEVEL SECURITY;
ALTER TABLE app.memberships NO FORCE ROW LEVEL SECURITY;
ALTER TABLE app.subscription_entitlements NO FORCE ROW LEVEL SECURITY;
ALTER TABLE app.outbox_messages NO FORCE ROW LEVEL SECURITY;
