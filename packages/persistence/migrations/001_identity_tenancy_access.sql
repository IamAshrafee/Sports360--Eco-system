CREATE SCHEMA IF NOT EXISTS auth;

REVOKE ALL ON SCHEMA app FROM PUBLIC;
REVOKE ALL ON SCHEMA auth FROM PUBLIC;

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'sports_runtime') THEN
    CREATE ROLE sports_runtime
      NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'sports_auth') THEN
    CREATE ROLE sports_auth
      NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
  END IF;
END
$$;

ALTER ROLE sports_runtime NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
ALTER ROLE sports_auth NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;

CREATE TABLE auth."user" (
  id text PRIMARY KEY DEFAULT uuidv7()::text,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false,
  image text,
  "createdAt" timestamptz NOT NULL DEFAULT clock_timestamp(),
  "updatedAt" timestamptz NOT NULL DEFAULT clock_timestamp(),
  "phoneNumber" text UNIQUE,
  "phoneNumberVerified" boolean NOT NULL DEFAULT false
);

CREATE TABLE auth."session" (
  id text PRIMARY KEY DEFAULT uuidv7()::text,
  "expiresAt" timestamptz NOT NULL,
  token text NOT NULL UNIQUE,
  "createdAt" timestamptz NOT NULL DEFAULT clock_timestamp(),
  "updatedAt" timestamptz NOT NULL DEFAULT clock_timestamp(),
  "ipAddress" text,
  "userAgent" text,
  "userId" text NOT NULL REFERENCES auth."user"(id) ON DELETE CASCADE
);

CREATE INDEX auth_session_user_id_idx ON auth."session" ("userId");

CREATE TABLE auth.account (
  id text PRIMARY KEY DEFAULT uuidv7()::text,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES auth."user"(id) ON DELETE CASCADE,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  scope text,
  password text,
  "createdAt" timestamptz NOT NULL DEFAULT clock_timestamp(),
  "updatedAt" timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE ("providerId", "accountId")
);

CREATE INDEX auth_account_user_id_idx ON auth.account ("userId");

CREATE TABLE auth.verification (
  id text PRIMARY KEY DEFAULT uuidv7()::text,
  identifier text NOT NULL,
  value text NOT NULL,
  "expiresAt" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT clock_timestamp(),
  "updatedAt" timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX auth_verification_identifier_idx
  ON auth.verification (identifier);

CREATE TABLE app.users (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  auth_subject_id text NOT NULL UNIQUE REFERENCES auth."user"(id) ON DELETE RESTRICT,
  display_name text NOT NULL CHECK (length(btrim(display_name)) BETWEEN 1 AND 120),
  state text NOT NULL DEFAULT 'ACTIVE'
    CHECK (state IN ('ACTIVE', 'SUSPENDED', 'CLOSED')),
  session_version integer NOT NULL DEFAULT 0 CHECK (session_version >= 0),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE app.businesses (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 160),
  slug text NOT NULL UNIQUE
    CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  currency_code text NOT NULL DEFAULT 'BDT'
    CHECK (currency_code ~ '^[A-Z]{3}$'),
  timezone text NOT NULL DEFAULT 'Asia/Dhaka',
  locale text NOT NULL DEFAULT 'en-BD',
  state text NOT NULL DEFAULT 'ACTIVE'
    CHECK (state IN ('TRIAL', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CLOSED')),
  owner_user_id uuid NOT NULL REFERENCES app.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE app.access_profiles (
  code text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  is_system boolean NOT NULL DEFAULT true
);

CREATE TABLE app.permissions (
  code text PRIMARY KEY,
  description text NOT NULL
);

CREATE TABLE app.profile_permissions (
  profile_code text NOT NULL REFERENCES app.access_profiles(code) ON DELETE CASCADE,
  permission_code text NOT NULL REFERENCES app.permissions(code) ON DELETE CASCADE,
  PRIMARY KEY (profile_code, permission_code)
);

INSERT INTO app.access_profiles (code, name, description) VALUES
  ('OWNER', 'Owner', 'Full business control, including staff and subscription settings.'),
  ('MANAGER', 'Manager', 'Daily operational control without ownership-only powers.'),
  ('BOOKING_STAFF', 'Booking staff', 'Bookings, customers, attendance, and payment collection.'),
  ('FINANCE_REPORTS', 'Finance and reports', 'Read-only finance, reporting, and audit access.');

INSERT INTO app.permissions (code, description) VALUES
  ('booking.read', 'View bookings and availability.'),
  ('booking.create', 'Create a booking.'),
  ('booking.change', 'Change a booking.'),
  ('booking.cancel', 'Cancel a booking.'),
  ('attendance.change', 'Record attendance.'),
  ('payment.read', 'View payment records.'),
  ('payment.collect', 'Record a collected payment.'),
  ('payment.verify', 'Verify a payment.'),
  ('payment.reverse', 'Reverse an incorrect payment entry.'),
  ('payment.refund', 'Record or initiate a refund.'),
  ('customer.read', 'View customers.'),
  ('customer.create', 'Create a customer.'),
  ('customer.change', 'Change customer details.'),
  ('customer.restrict', 'Restrict a customer.'),
  ('customer.merge', 'Merge duplicate customers.'),
  ('customer.export', 'Export customer data.'),
  ('resource.read', 'View venues and resources.'),
  ('resource.configure', 'Configure venues and resources.'),
  ('resource.block', 'Block resource capacity.'),
  ('staff.read', 'View staff and access.'),
  ('staff.invite', 'Invite staff.'),
  ('staff.change', 'Change staff access.'),
  ('staff.remove', 'Remove staff access.'),
  ('report.operational', 'View operational reports.'),
  ('report.financial', 'View financial reports.'),
  ('report.export', 'Export reports.'),
  ('report.audit', 'View the audit trail.'),
  ('settings.venue', 'Change venue settings.'),
  ('settings.business', 'Change business settings.'),
  ('subscription.read', 'View subscription details.'),
  ('subscription.manage', 'Manage the subscription.');

INSERT INTO app.profile_permissions (profile_code, permission_code)
SELECT 'OWNER', code FROM app.permissions;

INSERT INTO app.profile_permissions (profile_code, permission_code)
SELECT 'MANAGER', code
FROM app.permissions
WHERE code NOT IN (
  'staff.remove',
  'settings.business',
  'subscription.manage'
);

INSERT INTO app.profile_permissions (profile_code, permission_code)
SELECT 'BOOKING_STAFF', code
FROM app.permissions
WHERE code IN (
  'booking.read',
  'booking.create',
  'booking.change',
  'booking.cancel',
  'attendance.change',
  'payment.read',
  'payment.collect',
  'customer.read',
  'customer.create',
  'customer.change',
  'resource.read'
);

INSERT INTO app.profile_permissions (profile_code, permission_code)
SELECT 'FINANCE_REPORTS', code
FROM app.permissions
WHERE code IN (
  'booking.read',
  'payment.read',
  'customer.read',
  'resource.read',
  'report.operational',
  'report.financial',
  'report.export',
  'report.audit',
  'subscription.read'
);

CREATE TABLE app.memberships (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  business_id uuid NOT NULL REFERENCES app.businesses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES app.users(id) ON DELETE RESTRICT,
  profile_code text NOT NULL REFERENCES app.access_profiles(code) ON DELETE RESTRICT,
  state text NOT NULL DEFAULT 'ACTIVE'
    CHECK (state IN ('INVITED', 'ACTIVE', 'SUSPENDED', 'REMOVED')),
  scope_mode text NOT NULL DEFAULT 'BUSINESS'
    CHECK (scope_mode IN ('BUSINESS', 'SELECTED_VENUES')),
  access_version integer NOT NULL DEFAULT 0 CHECK (access_version >= 0),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (business_id, id),
  UNIQUE (business_id, user_id)
);

CREATE INDEX memberships_user_id_idx ON app.memberships (user_id);

CREATE TABLE app.venues (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  business_id uuid NOT NULL REFERENCES app.businesses(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 160),
  timezone text NOT NULL DEFAULT 'Asia/Dhaka',
  address_text text,
  state text NOT NULL DEFAULT 'ACTIVE'
    CHECK (state IN ('DRAFT', 'ACTIVE', 'INACTIVE')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (business_id, id)
);

CREATE TABLE app.membership_venue_scopes (
  business_id uuid NOT NULL,
  membership_id uuid NOT NULL,
  venue_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (business_id, membership_id, venue_id),
  FOREIGN KEY (business_id, membership_id)
    REFERENCES app.memberships(business_id, id) ON DELETE CASCADE,
  FOREIGN KEY (business_id, venue_id)
    REFERENCES app.venues(business_id, id) ON DELETE CASCADE
);

CREATE TABLE app.platform_administrators (
  user_id uuid PRIMARY KEY REFERENCES app.users(id) ON DELETE RESTRICT,
  state text NOT NULL DEFAULT 'ACTIVE'
    CHECK (state IN ('ACTIVE', 'SUSPENDED')),
  permissions text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CHECK (
    permissions <@ ARRAY[
      'platform.tenant_admin',
      'platform.entitlement',
      'platform.audit'
    ]::text[]
  )
);

CREATE TABLE app.subscription_entitlements (
  business_id uuid PRIMARY KEY REFERENCES app.businesses(id) ON DELETE CASCADE,
  plan_code text NOT NULL DEFAULT 'MVP_TRIAL',
  state text NOT NULL DEFAULT 'TRIAL'
    CHECK (state IN ('TRIAL', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELLED')),
  venue_limit integer NOT NULL DEFAULT 1 CHECK (venue_limit > 0),
  staff_limit integer NOT NULL DEFAULT 5 CHECK (staff_limit > 0),
  valid_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE app.audit_entries (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  business_id uuid REFERENCES app.businesses(id) ON DELETE RESTRICT,
  actor_user_id uuid REFERENCES app.users(id) ON DELETE SET NULL,
  actor_membership_id uuid,
  action text NOT NULL CHECK (length(action) BETWEEN 1 AND 160),
  entity_type text NOT NULL CHECK (length(entity_type) BETWEEN 1 AND 100),
  entity_id text,
  correlation_id text NOT NULL CHECK (length(correlation_id) BETWEEN 1 AND 128),
  occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  before_data jsonb,
  after_data jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CHECK (jsonb_typeof(metadata) = 'object'),
  FOREIGN KEY (business_id, actor_membership_id)
    REFERENCES app.memberships(business_id, id)
      ON DELETE SET NULL (actor_membership_id)
);

CREATE INDEX audit_entries_business_time_idx
  ON app.audit_entries (business_id, occurred_at DESC);

CREATE TABLE app.outbox_messages (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  business_id uuid REFERENCES app.businesses(id) ON DELETE CASCADE,
  topic text NOT NULL CHECK (length(topic) BETWEEN 1 AND 120),
  aggregate_type text NOT NULL CHECK (length(aggregate_type) BETWEEN 1 AND 100),
  aggregate_id text NOT NULL,
  payload jsonb NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  available_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  published_at timestamptz,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  locked_at timestamptz,
  locked_by text,
  last_error text,
  CHECK ((locked_at IS NULL) = (locked_by IS NULL)),
  CHECK (jsonb_typeof(payload) = 'object')
);

CREATE INDEX outbox_unpublished_idx
  ON app.outbox_messages (available_at, id)
  WHERE published_at IS NULL;

CREATE TABLE app.idempotency_records (
  business_id uuid NOT NULL REFERENCES app.businesses(id) ON DELETE CASCADE,
  operation text NOT NULL,
  idempotency_key text NOT NULL,
  request_hash text NOT NULL,
  response_status integer,
  response_body jsonb,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  expires_at timestamptz NOT NULL,
  PRIMARY KEY (business_id, operation, idempotency_key),
  CHECK (expires_at > created_at)
);

CREATE OR REPLACE FUNCTION app.current_business_id()
RETURNS uuid
LANGUAGE sql
STABLE
PARALLEL SAFE
AS $$
  SELECT nullif(current_setting('app.business_id', true), '')::uuid
$$;

CREATE OR REPLACE FUNCTION app.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
PARALLEL SAFE
AS $$
  SELECT nullif(current_setting('app.user_id', true), '')::uuid
$$;

CREATE OR REPLACE FUNCTION app.current_membership_id()
RETURNS uuid
LANGUAGE sql
STABLE
PARALLEL SAFE
AS $$
  SELECT nullif(current_setting('app.membership_id', true), '')::uuid
$$;

CREATE OR REPLACE FUNCTION app.venue_allowed(candidate_venue_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
PARALLEL SAFE
AS $$
  SELECT
    coalesce(nullif(current_setting('app.business_wide', true), '')::boolean, false)
    OR EXISTS (
      SELECT 1
      FROM jsonb_array_elements_text(
        coalesce(
          nullif(current_setting('app.allowed_venue_ids', true), '')::jsonb,
          '[]'::jsonb
        )
      ) AS allowed(id)
      WHERE allowed.id::uuid = candidate_venue_id
    )
$$;

CREATE OR REPLACE FUNCTION app.has_permission(candidate_permission text)
RETURNS boolean
LANGUAGE sql
STABLE
PARALLEL SAFE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM jsonb_array_elements_text(
      coalesce(
        nullif(current_setting('app.permissions', true), '')::jsonb,
        '[]'::jsonb
      )
    ) AS granted(code)
    WHERE granted.code = candidate_permission
  )
$$;

CREATE OR REPLACE FUNCTION app.resolve_auth_subject(candidate_auth_subject_id text)
RETURNS TABLE (user_id uuid, session_version integer, user_state text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, app
AS $$
  SELECT id, session_version, state
  FROM app.users
  WHERE auth_subject_id = candidate_auth_subject_id
$$;

CREATE OR REPLACE FUNCTION app.register_auth_subject(
  candidate_auth_subject_id text,
  candidate_display_name text
)
RETURNS uuid
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog, app, auth
AS $$
DECLARE
  application_user_id uuid;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth."user" WHERE id = candidate_auth_subject_id
  ) THEN
    RAISE EXCEPTION 'Authentication subject does not exist'
      USING ERRCODE = '23503';
  END IF;

  INSERT INTO app.users (auth_subject_id, display_name)
  VALUES (candidate_auth_subject_id, candidate_display_name)
  ON CONFLICT (auth_subject_id) DO UPDATE SET
    updated_at = clock_timestamp()
  RETURNING id INTO application_user_id;

  RETURN application_user_id;
END
$$;

CREATE OR REPLACE FUNCTION app.establish_user_context(
  candidate_auth_subject_id text,
  candidate_business_id uuid,
  candidate_session_version integer,
  candidate_correlation_id text
)
RETURNS TABLE (
  user_id uuid,
  membership_id uuid,
  business_id uuid,
  profile_code text,
  permissions text[],
  business_wide boolean,
  allowed_venue_ids uuid[],
  session_version integer,
  access_version integer
)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog, app
AS $$
DECLARE
  selected_user app.users%ROWTYPE;
  selected_membership app.memberships%ROWTYPE;
  granted_permissions text[];
  granted_venue_ids uuid[];
BEGIN
  IF candidate_correlation_id IS NULL
    OR length(candidate_correlation_id) NOT BETWEEN 1 AND 128 THEN
    RAISE EXCEPTION 'A valid correlation ID is required'
      USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO selected_user
  FROM app.users
  WHERE auth_subject_id = candidate_auth_subject_id
    AND state = 'ACTIVE';

  IF NOT FOUND OR selected_user.session_version <> candidate_session_version THEN
    RAISE EXCEPTION 'Session is invalid or revoked'
      USING ERRCODE = '28000';
  END IF;

  SELECT *
  INTO selected_membership
  FROM app.memberships
  WHERE business_id = candidate_business_id
    AND user_id = selected_user.id
    AND state = 'ACTIVE';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Active business membership is required'
      USING ERRCODE = '42501';
  END IF;

  SELECT coalesce(array_agg(pp.permission_code ORDER BY pp.permission_code), ARRAY[]::text[])
  INTO granted_permissions
  FROM app.profile_permissions pp
  WHERE pp.profile_code = selected_membership.profile_code;

  SELECT coalesce(array_agg(mvs.venue_id ORDER BY mvs.venue_id), ARRAY[]::uuid[])
  INTO granted_venue_ids
  FROM app.membership_venue_scopes mvs
  WHERE mvs.business_id = candidate_business_id
    AND mvs.membership_id = selected_membership.id;

  PERFORM set_config('app.user_id', selected_user.id::text, true);
  PERFORM set_config('app.membership_id', selected_membership.id::text, true);
  PERFORM set_config('app.business_id', candidate_business_id::text, true);
  PERFORM set_config(
    'app.business_wide',
    (selected_membership.scope_mode = 'BUSINESS')::text,
    true
  );
  PERFORM set_config('app.allowed_venue_ids', to_json(granted_venue_ids)::text, true);
  PERFORM set_config('app.permissions', to_json(granted_permissions)::text, true);
  PERFORM set_config('app.correlation_id', candidate_correlation_id, true);

  RETURN QUERY SELECT
    selected_user.id,
    selected_membership.id,
    selected_membership.business_id,
    selected_membership.profile_code,
    granted_permissions,
    selected_membership.scope_mode = 'BUSINESS',
    granted_venue_ids,
    selected_user.session_version,
    selected_membership.access_version;
END
$$;

CREATE OR REPLACE FUNCTION app.record_audit_entry(
  candidate_action text,
  candidate_entity_type text,
  candidate_entity_id text,
  candidate_before_data jsonb,
  candidate_after_data jsonb,
  candidate_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog, app
AS $$
DECLARE
  created_id uuid;
BEGIN
  IF app.current_business_id() IS NULL OR app.current_user_id() IS NULL THEN
    RAISE EXCEPTION 'Tenant context is required'
      USING ERRCODE = '42501';
  END IF;

  INSERT INTO app.audit_entries (
    business_id,
    actor_user_id,
    actor_membership_id,
    action,
    entity_type,
    entity_id,
    correlation_id,
    before_data,
    after_data,
    metadata
  )
  VALUES (
    app.current_business_id(),
    app.current_user_id(),
    app.current_membership_id(),
    candidate_action,
    candidate_entity_type,
    candidate_entity_id,
    current_setting('app.correlation_id'),
    candidate_before_data,
    candidate_after_data,
    coalesce(candidate_metadata, '{}'::jsonb)
  )
  RETURNING id INTO created_id;

  RETURN created_id;
END
$$;

CREATE OR REPLACE FUNCTION app.platform_list_businesses(
  candidate_auth_subject_id text,
  candidate_session_version integer
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  state text,
  subscription_state text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, app
AS $$
DECLARE
  platform_user_id uuid;
BEGIN
  SELECT u.id
  INTO platform_user_id
  FROM app.users u
  JOIN app.platform_administrators pa ON pa.user_id = u.id
  WHERE u.auth_subject_id = candidate_auth_subject_id
    AND u.session_version = candidate_session_version
    AND u.state = 'ACTIVE'
    AND pa.state = 'ACTIVE'
    AND 'platform.tenant_admin' = ANY(pa.permissions);

  IF platform_user_id IS NULL THEN
    RAISE EXCEPTION 'Platform administration permission is required'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    b.id,
    b.name,
    b.slug,
    b.state,
    coalesce(se.state, 'UNPROVISIONED')
  FROM app.businesses b
  LEFT JOIN app.subscription_entitlements se ON se.business_id = b.id
  ORDER BY b.created_at, b.id;
END
$$;

CREATE OR REPLACE FUNCTION app.prevent_audit_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Audit entries are append-only'
    USING ERRCODE = '55000';
END
$$;

CREATE TRIGGER audit_entries_are_immutable
BEFORE UPDATE OR DELETE ON app.audit_entries
FOR EACH ROW EXECUTE FUNCTION app.prevent_audit_mutation();

ALTER TABLE app.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.businesses FORCE ROW LEVEL SECURITY;
ALTER TABLE app.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.memberships FORCE ROW LEVEL SECURITY;
ALTER TABLE app.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.venues FORCE ROW LEVEL SECURITY;
ALTER TABLE app.membership_venue_scopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.membership_venue_scopes FORCE ROW LEVEL SECURITY;
ALTER TABLE app.subscription_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.subscription_entitlements FORCE ROW LEVEL SECURITY;
ALTER TABLE app.audit_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.audit_entries FORCE ROW LEVEL SECURITY;
ALTER TABLE app.outbox_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.outbox_messages FORCE ROW LEVEL SECURITY;
ALTER TABLE app.idempotency_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.idempotency_records FORCE ROW LEVEL SECURITY;

CREATE POLICY businesses_tenant_isolation ON app.businesses
  USING (id = app.current_business_id())
  WITH CHECK (id = app.current_business_id());

CREATE POLICY memberships_tenant_isolation ON app.memberships
  USING (business_id = app.current_business_id())
  WITH CHECK (business_id = app.current_business_id());

CREATE POLICY venues_tenant_and_scope_isolation ON app.venues
  USING (
    business_id = app.current_business_id()
    AND app.venue_allowed(id)
  )
  WITH CHECK (
    business_id = app.current_business_id()
    AND app.venue_allowed(id)
  );

CREATE POLICY membership_venue_scopes_tenant_isolation
  ON app.membership_venue_scopes
  USING (business_id = app.current_business_id())
  WITH CHECK (business_id = app.current_business_id());

CREATE POLICY subscription_entitlements_tenant_isolation
  ON app.subscription_entitlements
  USING (business_id = app.current_business_id())
  WITH CHECK (business_id = app.current_business_id());

CREATE POLICY audit_entries_tenant_isolation ON app.audit_entries
  USING (business_id = app.current_business_id())
  WITH CHECK (business_id = app.current_business_id());

CREATE POLICY outbox_messages_tenant_isolation ON app.outbox_messages
  USING (business_id = app.current_business_id())
  WITH CHECK (business_id = app.current_business_id());

CREATE POLICY idempotency_records_tenant_isolation
  ON app.idempotency_records
  USING (business_id = app.current_business_id())
  WITH CHECK (business_id = app.current_business_id());

CREATE OR REPLACE FUNCTION app.claim_outbox_messages(
  candidate_worker_id text,
  candidate_batch_size integer DEFAULT 50,
  candidate_lock_timeout interval DEFAULT interval '5 minutes'
)
RETURNS SETOF app.outbox_messages
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog, app
AS $$
  WITH candidates AS (
    SELECT id
    FROM app.outbox_messages
    WHERE published_at IS NULL
      AND available_at <= clock_timestamp()
      AND (
        locked_at IS NULL
        OR locked_at < clock_timestamp() - candidate_lock_timeout
      )
    ORDER BY available_at, id
    FOR UPDATE SKIP LOCKED
    LIMIT greatest(1, least(candidate_batch_size, 500))
  )
  UPDATE app.outbox_messages messages
  SET
    locked_at = clock_timestamp(),
    locked_by = candidate_worker_id,
    attempts = messages.attempts + 1
  FROM candidates
  WHERE messages.id = candidates.id
  RETURNING messages.*
$$;

CREATE OR REPLACE FUNCTION app.complete_outbox_message(
  candidate_message_id uuid,
  candidate_worker_id text
)
RETURNS boolean
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog, app
AS $$
  WITH completed AS (
    UPDATE app.outbox_messages
    SET
      published_at = clock_timestamp(),
      locked_at = NULL,
      locked_by = NULL,
      last_error = NULL
    WHERE id = candidate_message_id
      AND locked_by = candidate_worker_id
      AND published_at IS NULL
    RETURNING 1
  )
  SELECT EXISTS (SELECT 1 FROM completed)
$$;

CREATE OR REPLACE FUNCTION app.fail_outbox_message(
  candidate_message_id uuid,
  candidate_worker_id text,
  candidate_error text
)
RETURNS boolean
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog, app
AS $$
  WITH failed AS (
    UPDATE app.outbox_messages
    SET
      available_at = clock_timestamp()
        + make_interval(secs => least(3600, (5 * power(2, least(attempts, 9)))::integer)),
      locked_at = NULL,
      locked_by = NULL,
      last_error = left(candidate_error, 1000)
    WHERE id = candidate_message_id
      AND locked_by = candidate_worker_id
      AND published_at IS NULL
    RETURNING 1
  )
  SELECT EXISTS (SELECT 1 FROM failed)
$$;

GRANT USAGE ON SCHEMA auth TO sports_auth;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON ALL TABLES IN SCHEMA auth TO sports_auth;

GRANT USAGE ON SCHEMA app TO sports_runtime;
GRANT SELECT ON app.access_profiles, app.permissions, app.profile_permissions
  TO sports_runtime;
GRANT SELECT ON app.businesses, app.memberships, app.venues,
  app.membership_venue_scopes, app.subscription_entitlements,
  app.audit_entries
  TO sports_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON app.outbox_messages, app.idempotency_records
  TO sports_runtime;
GRANT EXECUTE ON FUNCTION app.resolve_auth_subject(text) TO sports_runtime;
GRANT EXECUTE ON FUNCTION app.register_auth_subject(text, text) TO sports_runtime;
GRANT EXECUTE ON FUNCTION app.establish_user_context(text, uuid, integer, text)
  TO sports_runtime;
GRANT EXECUTE ON FUNCTION app.record_audit_entry(text, text, text, jsonb, jsonb, jsonb)
  TO sports_runtime;
GRANT EXECUTE ON FUNCTION app.platform_list_businesses(text, integer)
  TO sports_runtime;
GRANT EXECUTE ON FUNCTION app.claim_outbox_messages(text, integer, interval)
  TO sports_runtime;
GRANT EXECUTE ON FUNCTION app.complete_outbox_message(uuid, text)
  TO sports_runtime;
GRANT EXECUTE ON FUNCTION app.fail_outbox_message(uuid, text, text)
  TO sports_runtime;

ALTER DEFAULT PRIVILEGES IN SCHEMA auth REVOKE ALL ON TABLES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA app REVOKE ALL ON TABLES FROM PUBLIC;
