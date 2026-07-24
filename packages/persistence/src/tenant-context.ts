import { actorContextSchema, type ActorContext } from "@sports/contracts"
import type { Pool, PoolClient } from "pg"

export interface TenantContextInput {
  authSubjectId: string
  businessId: string
  correlationId: string
  sessionVersion: number
}

interface EstablishedContextRow {
  access_version: number
  allowed_venue_ids: string[]
  business_id: string
  business_wide: boolean
  membership_id: string
  permissions: string[]
  profile_code: string
  session_version: number
  user_id: string
}

export async function withTenantContext<Result>(
  pool: Pool,
  input: TenantContextInput,
  operation: (client: PoolClient, actor: ActorContext) => Promise<Result>,
): Promise<Result> {
  const client = await pool.connect()

  try {
    await client.query("BEGIN")
    const context = await client.query<EstablishedContextRow>(
      "SELECT * FROM app.establish_user_context($1, $2, $3, $4)",
      [
        input.authSubjectId,
        input.businessId,
        input.sessionVersion,
        input.correlationId,
      ],
    )
    const row = context.rows[0]

    if (row === undefined) {
      throw new Error("Tenant context was not established")
    }

    const actor = actorContextSchema.parse({
      accessVersion: row.access_version,
      allowedVenueIds: row.allowed_venue_ids,
      businessId: row.business_id,
      businessWide: row.business_wide,
      correlationId: input.correlationId,
      membershipId: row.membership_id,
      permissions: row.permissions,
      profileCode: row.profile_code,
      sessionVersion: row.session_version,
      userId: row.user_id,
    })
    const result = await operation(client, actor)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined)
    throw error
  } finally {
    client.release()
  }
}
