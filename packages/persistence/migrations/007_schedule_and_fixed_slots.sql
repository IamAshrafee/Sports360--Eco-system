CREATE TABLE app.schedule_versions (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  business_id uuid NOT NULL,
  venue_id uuid NOT NULL,
  resource_id uuid,
  timezone text NOT NULL CHECK (length(btrim(timezone)) BETWEEN 1 AND 120),
  effective_from date NOT NULL,
  effective_until date,
  effective_during daterange GENERATED ALWAYS AS (
    daterange(effective_from, effective_until, '[)')
  ) STORED,
  version integer NOT NULL CHECK (version > 0),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (business_id, id),
  UNIQUE NULLS NOT DISTINCT (
    business_id,
    venue_id,
    resource_id,
    effective_from
  ),
  UNIQUE NULLS NOT DISTINCT (
    business_id,
    venue_id,
    resource_id,
    version
  ),
  CHECK (effective_until IS NULL OR effective_until > effective_from),
  FOREIGN KEY (business_id, venue_id)
    REFERENCES app.venues(business_id, id) ON DELETE RESTRICT,
  FOREIGN KEY (business_id, venue_id, resource_id)
    REFERENCES app.resources(business_id, venue_id, id) ON DELETE RESTRICT
);

ALTER TABLE app.schedule_versions
  ADD CONSTRAINT venue_schedule_effective_range_exclusion
  EXCLUDE USING gist (
    business_id WITH =,
    venue_id WITH =,
    effective_during WITH &&
  ) WHERE (resource_id IS NULL),
  ADD CONSTRAINT resource_schedule_effective_range_exclusion
  EXCLUDE USING gist (
    business_id WITH =,
    venue_id WITH =,
    resource_id WITH =,
    effective_during WITH &&
  ) WHERE (resource_id IS NOT NULL);

CREATE TABLE app.weekly_schedule_periods (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  business_id uuid NOT NULL,
  schedule_version_id uuid NOT NULL,
  weekday smallint NOT NULL CHECK (weekday BETWEEN 1 AND 7),
  opens_at time without time zone NOT NULL,
  closes_at time without time zone NOT NULL,
  crosses_midnight boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (business_id, id),
  FOREIGN KEY (business_id, schedule_version_id)
    REFERENCES app.schedule_versions(business_id, id) ON DELETE RESTRICT,
  CHECK (date_part('second', opens_at) = 0),
  CHECK (date_part('second', closes_at) = 0),
  CHECK (
    (crosses_midnight AND closes_at <= opens_at)
    OR (NOT crosses_midnight AND closes_at > opens_at)
  )
);

CREATE TABLE app.schedule_exceptions (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  business_id uuid NOT NULL,
  schedule_version_id uuid NOT NULL,
  local_date date NOT NULL,
  exception_kind text NOT NULL CHECK (exception_kind IN ('CLOSED', 'REPLACE')),
  reason text CHECK (
    reason IS NULL OR length(btrim(reason)) BETWEEN 1 AND 240
  ),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (business_id, id),
  UNIQUE (business_id, schedule_version_id, local_date),
  FOREIGN KEY (business_id, schedule_version_id)
    REFERENCES app.schedule_versions(business_id, id) ON DELETE RESTRICT
);

CREATE TABLE app.schedule_exception_periods (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  business_id uuid NOT NULL,
  schedule_exception_id uuid NOT NULL,
  opens_at time without time zone NOT NULL,
  closes_at time without time zone NOT NULL,
  crosses_midnight boolean NOT NULL DEFAULT false,
  local_minute_range int4range GENERATED ALWAYS AS (
    int4range(
      (
        extract(hour FROM opens_at)::integer * 60
        + extract(minute FROM opens_at)::integer
      ),
      (
        extract(hour FROM closes_at)::integer * 60
        + extract(minute FROM closes_at)::integer
        + CASE WHEN crosses_midnight THEN 1440 ELSE 0 END
      ),
      '[)'
    )
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (business_id, id),
  FOREIGN KEY (business_id, schedule_exception_id)
    REFERENCES app.schedule_exceptions(business_id, id) ON DELETE RESTRICT,
  CHECK (date_part('second', opens_at) = 0),
  CHECK (date_part('second', closes_at) = 0),
  CHECK (
    (crosses_midnight AND closes_at <= opens_at)
    OR (NOT crosses_midnight AND closes_at > opens_at)
  ),
  EXCLUDE USING gist (
    schedule_exception_id WITH =,
    local_minute_range WITH &&
  )
);

CREATE INDEX schedule_versions_effective_lookup_idx
  ON app.schedule_versions (
    business_id,
    venue_id,
    resource_id,
    effective_from DESC
  );
CREATE INDEX weekly_schedule_periods_version_weekday_idx
  ON app.weekly_schedule_periods (
    business_id,
    schedule_version_id,
    weekday,
    opens_at
  );
CREATE INDEX schedule_exceptions_version_date_idx
  ON app.schedule_exceptions (
    business_id,
    schedule_version_id,
    local_date
  );
CREATE INDEX schedule_exception_periods_exception_idx
  ON app.schedule_exception_periods (
    business_id,
    schedule_exception_id,
    opens_at
  );

CREATE OR REPLACE FUNCTION app.prevent_schedule_version_rewrite()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.business_id IS DISTINCT FROM OLD.business_id
    OR NEW.venue_id IS DISTINCT FROM OLD.venue_id
    OR NEW.resource_id IS DISTINCT FROM OLD.resource_id
    OR NEW.timezone IS DISTINCT FROM OLD.timezone
    OR NEW.effective_from IS DISTINCT FROM OLD.effective_from
    OR NEW.version IS DISTINCT FROM OLD.version
    OR NEW.created_at IS DISTINCT FROM OLD.created_at
  THEN
    RAISE EXCEPTION 'Schedule version content is immutable'
      USING ERRCODE = '23514';
  END IF;

  NEW.updated_at = clock_timestamp();
  RETURN NEW;
END
$$;

CREATE TRIGGER schedule_version_immutable_content
BEFORE UPDATE ON app.schedule_versions
FOR EACH ROW EXECUTE FUNCTION app.prevent_schedule_version_rewrite();

CREATE OR REPLACE FUNCTION app.assert_weekly_schedule_no_overlap(
  candidate_schedule_version_id uuid
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM app.weekly_schedule_periods first_period
    JOIN app.weekly_schedule_periods second_period
      ON second_period.schedule_version_id =
        first_period.schedule_version_id
      AND second_period.id > first_period.id
    CROSS JOIN generate_series(-1, 1) AS week_shift
    WHERE first_period.schedule_version_id =
      candidate_schedule_version_id
      AND int4range(
        (
          (first_period.weekday - 1) * 1440
          + extract(hour FROM first_period.opens_at)::integer * 60
          + extract(minute FROM first_period.opens_at)::integer
        ),
        (
          (first_period.weekday - 1) * 1440
          + extract(hour FROM first_period.closes_at)::integer * 60
          + extract(minute FROM first_period.closes_at)::integer
          + CASE WHEN first_period.crosses_midnight THEN 1440 ELSE 0 END
        ),
        '[)'
      ) && int4range(
        (
          (second_period.weekday - 1) * 1440
          + extract(hour FROM second_period.opens_at)::integer * 60
          + extract(minute FROM second_period.opens_at)::integer
          + week_shift * 10080
        ),
        (
          (second_period.weekday - 1) * 1440
          + extract(hour FROM second_period.closes_at)::integer * 60
          + extract(minute FROM second_period.closes_at)::integer
          + CASE WHEN second_period.crosses_midnight THEN 1440 ELSE 0 END
          + week_shift * 10080
        ),
        '[)'
      )
  ) THEN
    RAISE EXCEPTION 'Weekly schedule periods cannot overlap'
      USING ERRCODE = '23P01';
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION app.check_weekly_schedule_overlap()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM app.assert_weekly_schedule_no_overlap(
    coalesce(NEW.schedule_version_id, OLD.schedule_version_id)
  );
  RETURN coalesce(NEW, OLD);
END
$$;

CREATE CONSTRAINT TRIGGER weekly_schedule_no_overlap
AFTER INSERT OR UPDATE ON app.weekly_schedule_periods
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION app.check_weekly_schedule_overlap();

CREATE OR REPLACE FUNCTION app.assert_schedule_exception_shape(
  candidate_exception_id uuid
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  selected_kind text;
  period_count integer;
BEGIN
  SELECT exception_kind
  INTO selected_kind
  FROM app.schedule_exceptions
  WHERE id = candidate_exception_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  SELECT count(*)
  INTO period_count
  FROM app.schedule_exception_periods
  WHERE schedule_exception_id = candidate_exception_id;

  IF selected_kind = 'CLOSED' AND period_count <> 0 THEN
    RAISE EXCEPTION 'A closed schedule exception cannot contain periods'
      USING ERRCODE = '23514';
  END IF;

  IF selected_kind = 'REPLACE' AND period_count = 0 THEN
    RAISE EXCEPTION 'A replacement schedule exception requires a period'
      USING ERRCODE = '23514';
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION app.check_schedule_exception_shape()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM app.assert_schedule_exception_shape(
    coalesce(NEW.id, OLD.id)
  );
  RETURN coalesce(NEW, OLD);
END
$$;

CREATE CONSTRAINT TRIGGER schedule_exception_valid_shape
AFTER INSERT OR UPDATE ON app.schedule_exceptions
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION app.check_schedule_exception_shape();

ALTER TABLE app.schedule_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.schedule_versions FORCE ROW LEVEL SECURITY;
ALTER TABLE app.weekly_schedule_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.weekly_schedule_periods FORCE ROW LEVEL SECURITY;
ALTER TABLE app.schedule_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.schedule_exceptions FORCE ROW LEVEL SECURITY;
ALTER TABLE app.schedule_exception_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.schedule_exception_periods FORCE ROW LEVEL SECURITY;

CREATE POLICY schedule_versions_select ON app.schedule_versions
  FOR SELECT
  USING (
    business_id = app.current_business_id()
    AND app.venue_allowed(venue_id)
    AND app.has_permission('resource.read')
  );

CREATE POLICY schedule_versions_insert ON app.schedule_versions
  FOR INSERT
  WITH CHECK (
    business_id = app.current_business_id()
    AND app.venue_allowed(venue_id)
    AND app.has_permission('resource.configure')
  );

CREATE POLICY schedule_versions_update ON app.schedule_versions
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

CREATE POLICY weekly_schedule_periods_select
  ON app.weekly_schedule_periods
  FOR SELECT
  USING (
    business_id = app.current_business_id()
    AND app.has_permission('resource.read')
    AND EXISTS (
      SELECT 1
      FROM app.schedule_versions schedule
      WHERE schedule.business_id = weekly_schedule_periods.business_id
        AND schedule.id = weekly_schedule_periods.schedule_version_id
        AND app.venue_allowed(schedule.venue_id)
    )
  );

CREATE POLICY weekly_schedule_periods_insert
  ON app.weekly_schedule_periods
  FOR INSERT
  WITH CHECK (
    business_id = app.current_business_id()
    AND app.has_permission('resource.configure')
    AND EXISTS (
      SELECT 1
      FROM app.schedule_versions schedule
      WHERE schedule.business_id = weekly_schedule_periods.business_id
        AND schedule.id = weekly_schedule_periods.schedule_version_id
        AND app.venue_allowed(schedule.venue_id)
    )
  );

CREATE POLICY schedule_exceptions_select ON app.schedule_exceptions
  FOR SELECT
  USING (
    business_id = app.current_business_id()
    AND app.has_permission('resource.read')
    AND EXISTS (
      SELECT 1
      FROM app.schedule_versions schedule
      WHERE schedule.business_id = schedule_exceptions.business_id
        AND schedule.id = schedule_exceptions.schedule_version_id
        AND app.venue_allowed(schedule.venue_id)
    )
  );

CREATE POLICY schedule_exceptions_insert ON app.schedule_exceptions
  FOR INSERT
  WITH CHECK (
    business_id = app.current_business_id()
    AND app.has_permission('resource.configure')
    AND EXISTS (
      SELECT 1
      FROM app.schedule_versions schedule
      WHERE schedule.business_id = schedule_exceptions.business_id
        AND schedule.id = schedule_exceptions.schedule_version_id
        AND app.venue_allowed(schedule.venue_id)
    )
  );

CREATE POLICY schedule_exception_periods_select
  ON app.schedule_exception_periods
  FOR SELECT
  USING (
    business_id = app.current_business_id()
    AND app.has_permission('resource.read')
    AND EXISTS (
      SELECT 1
      FROM app.schedule_exceptions exception
      JOIN app.schedule_versions schedule
        ON schedule.business_id = exception.business_id
        AND schedule.id = exception.schedule_version_id
      WHERE exception.business_id = schedule_exception_periods.business_id
        AND exception.id =
          schedule_exception_periods.schedule_exception_id
        AND app.venue_allowed(schedule.venue_id)
    )
  );

CREATE POLICY schedule_exception_periods_insert
  ON app.schedule_exception_periods
  FOR INSERT
  WITH CHECK (
    business_id = app.current_business_id()
    AND app.has_permission('resource.configure')
    AND EXISTS (
      SELECT 1
      FROM app.schedule_exceptions exception
      JOIN app.schedule_versions schedule
        ON schedule.business_id = exception.business_id
        AND schedule.id = exception.schedule_version_id
      WHERE exception.business_id = schedule_exception_periods.business_id
        AND exception.id =
          schedule_exception_periods.schedule_exception_id
        AND app.venue_allowed(schedule.venue_id)
    )
  );

GRANT SELECT, INSERT, UPDATE ON app.schedule_versions TO sports_runtime;
GRANT SELECT, INSERT ON app.weekly_schedule_periods TO sports_runtime;
GRANT SELECT, INSERT ON app.schedule_exceptions TO sports_runtime;
GRANT SELECT, INSERT ON app.schedule_exception_periods TO sports_runtime;
