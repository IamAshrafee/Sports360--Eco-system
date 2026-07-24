import { Kysely, PostgresDialect, type Generated } from "kysely"
import { Pool, type PoolConfig } from "pg"

export interface DatabaseSchema {
  "app.businesses": {
    created_at: Generated<Date>
    currency_code: string
    id: Generated<string>
    locale: string
    name: string
    owner_user_id: string
    slug: string
    state: string
    timezone: string
    updated_at: Generated<Date>
  }
  "app.memberships": {
    access_version: Generated<number>
    business_id: string
    created_at: Generated<Date>
    id: Generated<string>
    profile_code: string
    scope_mode: string
    state: string
    updated_at: Generated<Date>
    user_id: string
  }
  "app.users": {
    auth_subject_id: string
    created_at: Generated<Date>
    display_name: string
    id: Generated<string>
    session_version: Generated<number>
    state: string
    updated_at: Generated<Date>
  }
}

export function createPool(
  connectionString: string,
  overrides: Omit<PoolConfig, "connectionString"> = {},
): Pool {
  return new Pool({
    connectionString,
    application_name: "sports-management",
    max: 10,
    ...overrides,
  })
}

export function createDatabase(pool: Pool): Kysely<DatabaseSchema> {
  return new Kysely<DatabaseSchema>({
    dialect: new PostgresDialect({ pool }),
  })
}
