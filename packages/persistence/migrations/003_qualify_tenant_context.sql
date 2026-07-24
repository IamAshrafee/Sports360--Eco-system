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

  SELECT u.*
  INTO selected_user
  FROM app.users AS u
  WHERE u.auth_subject_id = candidate_auth_subject_id
    AND u.state = 'ACTIVE';

  IF NOT FOUND OR selected_user.session_version <> candidate_session_version THEN
    RAISE EXCEPTION 'Session is invalid or revoked'
      USING ERRCODE = '28000';
  END IF;

  SELECT m.*
  INTO selected_membership
  FROM app.memberships AS m
  WHERE m.business_id = candidate_business_id
    AND m.user_id = selected_user.id
    AND m.state = 'ACTIVE';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Active business membership is required'
      USING ERRCODE = '42501';
  END IF;

  SELECT coalesce(
    array_agg(pp.permission_code ORDER BY pp.permission_code),
    ARRAY[]::text[]
  )
  INTO granted_permissions
  FROM app.profile_permissions AS pp
  WHERE pp.profile_code = selected_membership.profile_code;

  SELECT coalesce(
    array_agg(mvs.venue_id ORDER BY mvs.venue_id),
    ARRAY[]::uuid[]
  )
  INTO granted_venue_ids
  FROM app.membership_venue_scopes AS mvs
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
