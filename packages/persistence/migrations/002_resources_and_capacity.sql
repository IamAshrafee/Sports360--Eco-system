CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE app.resources (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  business_id uuid NOT NULL,
  venue_id uuid NOT NULL,
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 160),
  activity_code text NOT NULL CHECK (activity_code ~ '^[a-z0-9_]+$'),
  capacity integer NOT NULL DEFAULT 1 CHECK (capacity BETWEEN 1 AND 100),
  state text NOT NULL DEFAULT 'ACTIVE'
    CHECK (state IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'MAINTENANCE')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (business_id, id),
  UNIQUE (business_id, venue_id, id),
  FOREIGN KEY (business_id, venue_id)
    REFERENCES app.venues(business_id, id) ON DELETE CASCADE
);

CREATE TABLE app.resource_units (
  business_id uuid NOT NULL,
  resource_id uuid NOT NULL,
  unit_number smallint NOT NULL CHECK (unit_number > 0),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (business_id, resource_id, unit_number),
  FOREIGN KEY (business_id, resource_id)
    REFERENCES app.resources(business_id, id) ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION app.validate_resource_unit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  resource_capacity integer;
BEGIN
  SELECT capacity
  INTO resource_capacity
  FROM app.resources
  WHERE business_id = NEW.business_id
    AND id = NEW.resource_id;

  IF resource_capacity IS NULL OR NEW.unit_number > resource_capacity THEN
    RAISE EXCEPTION 'Resource unit exceeds configured capacity'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END
$$;

CREATE TRIGGER resource_unit_within_capacity
BEFORE INSERT OR UPDATE ON app.resource_units
FOR EACH ROW EXECUTE FUNCTION app.validate_resource_unit();

CREATE TABLE app.capacity_claims (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  business_id uuid NOT NULL,
  venue_id uuid NOT NULL,
  resource_id uuid NOT NULL,
  unit_number smallint NOT NULL,
  claim_type text NOT NULL
    CHECK (claim_type IN ('BOOKING', 'BLOCK', 'HOLD')),
  claim_reference_id uuid NOT NULL,
  during tstzrange NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  released_at timestamptz,
  UNIQUE (business_id, id),
  CHECK (NOT isempty(during)),
  CHECK (lower_inc(during) AND NOT upper_inc(during)),
  CHECK (lower(during) < upper(during)),
  FOREIGN KEY (business_id, venue_id, resource_id)
    REFERENCES app.resources(business_id, venue_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (business_id, resource_id, unit_number)
    REFERENCES app.resource_units(business_id, resource_id, unit_number)
      ON DELETE RESTRICT,
  EXCLUDE USING gist (
    business_id WITH =,
    resource_id WITH =,
    unit_number WITH =,
    during WITH &&
  ) WHERE (released_at IS NULL)
);

CREATE INDEX capacity_claims_reference_idx
  ON app.capacity_claims (business_id, claim_type, claim_reference_id);

ALTER TABLE app.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.resources FORCE ROW LEVEL SECURITY;
ALTER TABLE app.resource_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.resource_units FORCE ROW LEVEL SECURITY;
ALTER TABLE app.capacity_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.capacity_claims FORCE ROW LEVEL SECURITY;

CREATE POLICY resources_tenant_and_scope_isolation ON app.resources
  USING (
    business_id = app.current_business_id()
    AND app.venue_allowed(venue_id)
  )
  WITH CHECK (
    business_id = app.current_business_id()
    AND app.venue_allowed(venue_id)
  );

CREATE POLICY resource_units_tenant_isolation ON app.resource_units
  USING (business_id = app.current_business_id())
  WITH CHECK (business_id = app.current_business_id());

CREATE POLICY capacity_claims_tenant_and_scope_isolation ON app.capacity_claims
  USING (
    business_id = app.current_business_id()
    AND app.venue_allowed(venue_id)
  )
  WITH CHECK (
    business_id = app.current_business_id()
    AND app.venue_allowed(venue_id)
  );

GRANT SELECT ON app.resources, app.resource_units, app.capacity_claims
  TO sports_runtime;
GRANT INSERT, UPDATE, DELETE ON app.capacity_claims
  TO sports_runtime;
