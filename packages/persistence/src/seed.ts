import type { Pool } from "pg"

export const demoIds = {
  businessA: "019b7000-0000-7000-8000-000000000001",
  businessB: "019b7000-0000-7000-8000-000000000002",
  offeringA: "019b7000-0000-7000-8000-000000000501",
  offeringB: "019b7000-0000-7000-8000-000000000502",
  membershipA: "019b7000-0000-7000-8000-000000000101",
  membershipB: "019b7000-0000-7000-8000-000000000102",
  resourceA: "019b7000-0000-7000-8000-000000000301",
  resourceB: "019b7000-0000-7000-8000-000000000302",
  userA: "019b7000-0000-7000-8000-000000000011",
  userB: "019b7000-0000-7000-8000-000000000012",
  venueA: "019b7000-0000-7000-8000-000000000201",
  venueB: "019b7000-0000-7000-8000-000000000202",
} as const

export const demoAuthSubjects = {
  ownerA: "demo-owner-a",
  ownerB: "demo-owner-b",
} as const

export async function seedDemoData(pool: Pool): Promise<void> {
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    await client.query(
      `
        INSERT INTO auth."user" (
          id, name, email, "emailVerified", "phoneNumber", "phoneNumberVerified"
        )
        VALUES
          ($1, 'Rahim Venue Owner', 'rahim@example.test', true, '+8801700000001', true),
          ($2, 'Karim Venue Owner', 'karim@example.test', true, '+8801700000002', true)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          "phoneNumber" = EXCLUDED."phoneNumber",
          "updatedAt" = clock_timestamp()
      `,
      [demoAuthSubjects.ownerA, demoAuthSubjects.ownerB],
    )

    await client.query(
      `
        INSERT INTO app.users (id, auth_subject_id, display_name)
        VALUES
          ($1, $2, 'Rahim Venue Owner'),
          ($3, $4, 'Karim Venue Owner')
        ON CONFLICT (id) DO UPDATE SET
          display_name = EXCLUDED.display_name,
          updated_at = clock_timestamp()
      `,
      [
        demoIds.userA,
        demoAuthSubjects.ownerA,
        demoIds.userB,
        demoAuthSubjects.ownerB,
      ],
    )

    await client.query(
      `
        INSERT INTO app.businesses (
          id, name, slug, owner_user_id, state
        )
        VALUES
          ($1, 'Dhaka Turf Demo', 'dhaka-turf-demo', $2, 'ACTIVE'),
          ($3, 'Chattogram Courts Demo', 'chattogram-courts-demo', $4, 'ACTIVE')
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          owner_user_id = EXCLUDED.owner_user_id,
          updated_at = clock_timestamp()
      `,
      [demoIds.businessA, demoIds.userA, demoIds.businessB, demoIds.userB],
    )

    await client.query(
      `
        INSERT INTO app.memberships (
          id, business_id, user_id, profile_code, state, scope_mode
        )
        VALUES
          ($1, $2, $3, 'OWNER', 'ACTIVE', 'BUSINESS'),
          ($4, $5, $6, 'OWNER', 'ACTIVE', 'BUSINESS')
        ON CONFLICT (business_id, user_id) DO UPDATE SET
          profile_code = EXCLUDED.profile_code,
          state = EXCLUDED.state,
          scope_mode = EXCLUDED.scope_mode,
          updated_at = clock_timestamp()
      `,
      [
        demoIds.membershipA,
        demoIds.businessA,
        demoIds.userA,
        demoIds.membershipB,
        demoIds.businessB,
        demoIds.userB,
      ],
    )

    await client.query(
      `
        INSERT INTO app.venues (id, business_id, name, state)
        VALUES
          ($1, $2, 'Mirpur Demo Venue', 'ACTIVE'),
          ($3, $4, 'Agrabad Demo Venue', 'ACTIVE')
        ON CONFLICT (business_id, id) DO UPDATE SET
          name = EXCLUDED.name,
          updated_at = clock_timestamp()
      `,
      [demoIds.venueA, demoIds.businessA, demoIds.venueB, demoIds.businessB],
    )

    await client.query(
      `
        INSERT INTO app.activities (business_id, code, display_name, state)
        VALUES
          ($1, 'football', 'Football', 'ACTIVE'),
          ($2, 'badminton', 'Badminton', 'ACTIVE')
        ON CONFLICT (business_id, code) DO UPDATE SET
          display_name = EXCLUDED.display_name,
          state = EXCLUDED.state,
          updated_at = clock_timestamp()
      `,
      [demoIds.businessA, demoIds.businessB],
    )

    await client.query(
      `
        INSERT INTO app.resources (
          id, business_id, venue_id, name, activity_code, activity_id,
          capacity, state
        )
        VALUES
          (
            $1, $2, $3, 'Football Turf 1', 'football',
            (SELECT id FROM app.activities WHERE business_id = $2 AND code = 'football'),
            1, 'ACTIVE'
          ),
          (
            $4, $5, $6, 'Badminton Court 1', 'badminton',
            (SELECT id FROM app.activities WHERE business_id = $5 AND code = 'badminton'),
            1, 'ACTIVE'
          )
        ON CONFLICT (business_id, id) DO UPDATE SET
          name = EXCLUDED.name,
          activity_code = EXCLUDED.activity_code,
          activity_id = EXCLUDED.activity_id,
          capacity = EXCLUDED.capacity,
          state = EXCLUDED.state,
          updated_at = clock_timestamp()
      `,
      [
        demoIds.resourceA,
        demoIds.businessA,
        demoIds.venueA,
        demoIds.resourceB,
        demoIds.businessB,
        demoIds.venueB,
      ],
    )

    await client.query(
      `
        INSERT INTO app.offerings (
          id, business_id, venue_id, activity_id, name, duration_minutes, state
        )
        VALUES
          (
            $1, $2, $3,
            (SELECT id FROM app.activities WHERE business_id = $2 AND code = 'football'),
            'Football — 60 minutes', 60, 'ACTIVE'
          ),
          (
            $4, $5, $6,
            (SELECT id FROM app.activities WHERE business_id = $5 AND code = 'badminton'),
            'Badminton — 60 minutes', 60, 'ACTIVE'
          )
        ON CONFLICT (business_id, id) DO UPDATE SET
          activity_id = EXCLUDED.activity_id,
          name = EXCLUDED.name,
          duration_minutes = EXCLUDED.duration_minutes,
          state = EXCLUDED.state,
          updated_at = clock_timestamp()
      `,
      [
        demoIds.offeringA,
        demoIds.businessA,
        demoIds.venueA,
        demoIds.offeringB,
        demoIds.businessB,
        demoIds.venueB,
      ],
    )

    await client.query(
      `
        INSERT INTO app.offering_resources (
          business_id, venue_id, offering_id, resource_id, activity_id
        )
        SELECT
          offerings.business_id,
          offerings.venue_id,
          offerings.id,
          resources.id,
          offerings.activity_id
        FROM app.offerings offerings
        JOIN app.resources resources
          ON resources.business_id = offerings.business_id
          AND resources.venue_id = offerings.venue_id
          AND resources.activity_id = offerings.activity_id
        WHERE offerings.id IN ($1, $2)
          AND resources.id IN ($3, $4)
        ON CONFLICT DO NOTHING
      `,
      [
        demoIds.offeringA,
        demoIds.offeringB,
        demoIds.resourceA,
        demoIds.resourceB,
      ],
    )

    await client.query(
      `
        INSERT INTO app.resource_units (business_id, resource_id, unit_number)
        VALUES
          ($1, $2, 1),
          ($3, $4, 1)
        ON CONFLICT DO NOTHING
      `,
      [
        demoIds.businessA,
        demoIds.resourceA,
        demoIds.businessB,
        demoIds.resourceB,
      ],
    )

    await client.query(
      `
        INSERT INTO app.subscription_entitlements (
          business_id, plan_code, state, venue_limit, staff_limit
        )
        VALUES
          ($1, 'MVP_TRIAL', 'TRIAL', 2, 5),
          ($2, 'MVP_TRIAL', 'TRIAL', 2, 5)
        ON CONFLICT (business_id) DO UPDATE SET
          plan_code = EXCLUDED.plan_code,
          state = EXCLUDED.state,
          venue_limit = EXCLUDED.venue_limit,
          staff_limit = EXCLUDED.staff_limit,
          updated_at = clock_timestamp()
      `,
      [demoIds.businessA, demoIds.businessB],
    )

    await client.query("COMMIT")
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}
