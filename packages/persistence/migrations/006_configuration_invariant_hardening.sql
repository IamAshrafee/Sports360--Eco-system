CREATE OR REPLACE FUNCTION app.check_activity_offering_readiness()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  linked_offering record;
BEGIN
  FOR linked_offering IN
    SELECT id
    FROM app.offerings
    WHERE business_id = NEW.business_id
      AND activity_id = NEW.id
  LOOP
    PERFORM app.assert_active_offering_ready(
      NEW.business_id,
      linked_offering.id
    );
  END LOOP;

  RETURN NEW;
END
$$;

CREATE CONSTRAINT TRIGGER activity_offering_readiness
AFTER UPDATE OF state ON app.activities
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION app.check_activity_offering_readiness();

DROP POLICY resource_units_select ON app.resource_units;
DROP POLICY resource_units_insert ON app.resource_units;

CREATE POLICY resource_units_select ON app.resource_units
  FOR SELECT
  USING (
    business_id = app.current_business_id()
    AND app.has_permission('resource.read')
    AND EXISTS (
      SELECT 1
      FROM app.resources resources
      WHERE resources.business_id = resource_units.business_id
        AND resources.id = resource_units.resource_id
    )
  );

CREATE POLICY resource_units_insert ON app.resource_units
  FOR INSERT
  WITH CHECK (
    business_id = app.current_business_id()
    AND app.has_permission('resource.configure')
    AND unit_number = 1
    AND EXISTS (
      SELECT 1
      FROM app.resources resources
      WHERE resources.business_id = resource_units.business_id
        AND resources.id = resource_units.resource_id
    )
  );
