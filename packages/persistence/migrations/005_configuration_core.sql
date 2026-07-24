CREATE TABLE app.activities (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  business_id uuid NOT NULL REFERENCES app.businesses(id) ON DELETE RESTRICT,
  code text NOT NULL CHECK (code ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  display_name text NOT NULL
    CHECK (length(btrim(display_name)) BETWEEN 1 AND 120),
  state text NOT NULL DEFAULT 'ACTIVE'
    CHECK (state IN ('ACTIVE', 'INACTIVE')),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (business_id, id),
  UNIQUE (business_id, code)
);

ALTER TABLE app.resources
  ADD COLUMN activity_id uuid,
  ADD COLUMN version integer NOT NULL DEFAULT 1 CHECK (version > 0);

INSERT INTO app.activities (business_id, code, display_name)
SELECT DISTINCT
  business_id,
  replace(activity_code, '_', '-'),
  initcap(replace(activity_code, '_', ' '))
FROM app.resources
ON CONFLICT (business_id, code) DO NOTHING;

UPDATE app.resources resources
SET activity_id = activities.id
FROM app.activities activities
WHERE activities.business_id = resources.business_id
  AND activities.code = replace(resources.activity_code, '_', '-')
  AND resources.activity_id IS NULL;

ALTER TABLE app.resources
  ALTER COLUMN activity_id SET NOT NULL,
  ADD CONSTRAINT resources_business_activity_fk
    FOREIGN KEY (business_id, activity_id)
    REFERENCES app.activities(business_id, id) ON DELETE RESTRICT,
  ADD CONSTRAINT resources_independent_capacity_check CHECK (capacity >= 1),
  ADD CONSTRAINT resources_business_venue_id_activity_unique
    UNIQUE (business_id, venue_id, id, activity_id);

CREATE UNIQUE INDEX resources_business_venue_name_unique
  ON app.resources (business_id, venue_id, lower(name));

CREATE TABLE app.offerings (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  business_id uuid NOT NULL,
  venue_id uuid NOT NULL,
  activity_id uuid NOT NULL,
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 160),
  duration_minutes integer NOT NULL
    CHECK (duration_minutes BETWEEN 1 AND 1440),
  state text NOT NULL DEFAULT 'DRAFT'
    CHECK (state IN ('DRAFT', 'ACTIVE', 'INACTIVE')),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (business_id, id),
  UNIQUE (business_id, venue_id, id),
  UNIQUE (business_id, venue_id, id, activity_id),
  FOREIGN KEY (business_id, venue_id)
    REFERENCES app.venues(business_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (business_id, activity_id)
    REFERENCES app.activities(business_id, id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX offerings_retry_duplicate_unique
  ON app.offerings (
    business_id,
    venue_id,
    activity_id,
    lower(name),
    duration_minutes
  );

CREATE TABLE app.offering_resources (
  business_id uuid NOT NULL,
  venue_id uuid NOT NULL,
  offering_id uuid NOT NULL,
  resource_id uuid NOT NULL,
  activity_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (business_id, offering_id, resource_id),
  FOREIGN KEY (business_id, venue_id, offering_id, activity_id)
    REFERENCES app.offerings(business_id, venue_id, id, activity_id)
    ON DELETE RESTRICT
    DEFERRABLE INITIALLY DEFERRED,
  FOREIGN KEY (business_id, venue_id, resource_id, activity_id)
    REFERENCES app.resources(business_id, venue_id, id, activity_id)
    ON DELETE RESTRICT
    DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX activities_business_state_name_idx
  ON app.activities (business_id, state, display_name, id);
CREATE INDEX resources_venue_state_name_idx
  ON app.resources (business_id, venue_id, state, name, id);
CREATE INDEX offerings_venue_state_name_idx
  ON app.offerings (business_id, venue_id, state, name, id);
CREATE INDEX offering_resources_resource_idx
  ON app.offering_resources (business_id, venue_id, resource_id, offering_id);

CREATE OR REPLACE FUNCTION app.assert_active_offering_ready(
  candidate_business_id uuid,
  candidate_offering_id uuid
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  selected_offering app.offerings%ROWTYPE;
BEGIN
  SELECT *
  INTO selected_offering
  FROM app.offerings
  WHERE business_id = candidate_business_id
    AND id = candidate_offering_id;

  IF NOT FOUND OR selected_offering.state <> 'ACTIVE' THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM app.activities activities
    WHERE activities.business_id = selected_offering.business_id
      AND activities.id = selected_offering.activity_id
      AND activities.state = 'ACTIVE'
  ) THEN
    RAISE EXCEPTION 'An active offering requires an active activity'
      USING ERRCODE = '23514';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM app.offering_resources compatibility
    JOIN app.resources resources
      ON resources.business_id = compatibility.business_id
      AND resources.venue_id = compatibility.venue_id
      AND resources.id = compatibility.resource_id
      AND resources.activity_id = compatibility.activity_id
    WHERE compatibility.business_id = selected_offering.business_id
      AND compatibility.offering_id = selected_offering.id
      AND resources.state = 'ACTIVE'
  ) THEN
    RAISE EXCEPTION 'An active offering requires a compatible active resource'
      USING ERRCODE = '23514';
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION app.check_offering_row_readiness()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM app.assert_active_offering_ready(NEW.business_id, NEW.id);
  RETURN NEW;
END
$$;

CREATE CONSTRAINT TRIGGER offering_row_readiness
AFTER INSERT OR UPDATE OF state, activity_id, venue_id ON app.offerings
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION app.check_offering_row_readiness();

CREATE OR REPLACE FUNCTION app.check_offering_resource_readiness()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP <> 'INSERT' THEN
    PERFORM app.assert_active_offering_ready(
      OLD.business_id,
      OLD.offering_id
    );
  END IF;

  IF TG_OP <> 'DELETE' THEN
    PERFORM app.assert_active_offering_ready(
      NEW.business_id,
      NEW.offering_id
    );
  END IF;

  RETURN coalesce(NEW, OLD);
END
$$;

CREATE CONSTRAINT TRIGGER offering_resource_readiness
AFTER INSERT OR UPDATE OR DELETE ON app.offering_resources
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION app.check_offering_resource_readiness();

CREATE OR REPLACE FUNCTION app.check_resource_offering_readiness()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  linked_offering record;
BEGIN
  FOR linked_offering IN
    SELECT offering_id
    FROM app.offering_resources
    WHERE business_id = NEW.business_id
      AND resource_id = NEW.id
  LOOP
    PERFORM app.assert_active_offering_ready(
      NEW.business_id,
      linked_offering.offering_id
    );
  END LOOP;

  RETURN NEW;
END
$$;

CREATE CONSTRAINT TRIGGER resource_offering_readiness
AFTER UPDATE OF state, activity_id ON app.resources
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION app.check_resource_offering_readiness();

ALTER TABLE app.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.activities FORCE ROW LEVEL SECURITY;
ALTER TABLE app.offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.offerings FORCE ROW LEVEL SECURITY;
ALTER TABLE app.offering_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.offering_resources FORCE ROW LEVEL SECURITY;

CREATE POLICY activities_select ON app.activities
  FOR SELECT
  USING (
    business_id = app.current_business_id()
    AND app.has_permission('resource.read')
  );

CREATE POLICY activities_insert ON app.activities
  FOR INSERT
  WITH CHECK (
    business_id = app.current_business_id()
    AND app.has_permission('resource.configure')
  );

CREATE POLICY activities_update ON app.activities
  FOR UPDATE
  USING (
    business_id = app.current_business_id()
    AND app.has_permission('resource.configure')
  )
  WITH CHECK (
    business_id = app.current_business_id()
    AND app.has_permission('resource.configure')
  );

DROP POLICY resources_tenant_and_scope_isolation ON app.resources;

CREATE POLICY resources_select ON app.resources
  FOR SELECT
  USING (
    business_id = app.current_business_id()
    AND app.venue_allowed(venue_id)
    AND app.has_permission('resource.read')
  );

CREATE POLICY resources_insert ON app.resources
  FOR INSERT
  WITH CHECK (
    business_id = app.current_business_id()
    AND app.venue_allowed(venue_id)
    AND app.has_permission('resource.configure')
    AND capacity = 1
  );

CREATE POLICY resources_update ON app.resources
  FOR UPDATE
  USING (
    business_id = app.current_business_id()
    AND app.venue_allowed(venue_id)
    AND app.has_permission('resource.configure')
  )
  WITH CHECK (
    business_id = app.current_business_id()
    AND app.venue_allowed(venue_id)
    AND app.has_permission('resource.configure')
    AND capacity = 1
  );

DROP POLICY resource_units_tenant_isolation ON app.resource_units;

CREATE POLICY resource_units_select ON app.resource_units
  FOR SELECT
  USING (
    business_id = app.current_business_id()
    AND app.has_permission('resource.read')
  );

CREATE POLICY resource_units_insert ON app.resource_units
  FOR INSERT
  WITH CHECK (
    business_id = app.current_business_id()
    AND app.has_permission('resource.configure')
    AND unit_number = 1
  );

CREATE POLICY offerings_select ON app.offerings
  FOR SELECT
  USING (
    business_id = app.current_business_id()
    AND app.venue_allowed(venue_id)
    AND app.has_permission('resource.read')
  );

CREATE POLICY offerings_insert ON app.offerings
  FOR INSERT
  WITH CHECK (
    business_id = app.current_business_id()
    AND app.venue_allowed(venue_id)
    AND app.has_permission('resource.configure')
  );

CREATE POLICY offerings_update ON app.offerings
  FOR UPDATE
  USING (
    business_id = app.current_business_id()
    AND app.venue_allowed(venue_id)
    AND app.has_permission('resource.configure')
  )
  WITH CHECK (
    business_id = app.current_business_id()
    AND app.venue_allowed(venue_id)
    AND app.has_permission('resource.configure')
  );

CREATE POLICY offering_resources_select ON app.offering_resources
  FOR SELECT
  USING (
    business_id = app.current_business_id()
    AND app.venue_allowed(venue_id)
    AND app.has_permission('resource.read')
  );

CREATE POLICY offering_resources_insert ON app.offering_resources
  FOR INSERT
  WITH CHECK (
    business_id = app.current_business_id()
    AND app.venue_allowed(venue_id)
    AND app.has_permission('resource.configure')
  );

CREATE POLICY offering_resources_delete ON app.offering_resources
  FOR DELETE
  USING (
    business_id = app.current_business_id()
    AND app.venue_allowed(venue_id)
    AND app.has_permission('resource.configure')
  );

GRANT SELECT, INSERT, UPDATE ON app.activities, app.resources, app.offerings
  TO sports_runtime;
GRANT SELECT, INSERT ON app.resource_units TO sports_runtime;
GRANT SELECT, INSERT, DELETE ON app.offering_resources TO sports_runtime;

