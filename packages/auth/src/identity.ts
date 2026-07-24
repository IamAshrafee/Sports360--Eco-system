import type { Pool } from "pg"

export interface ApplicationIdentity {
  sessionVersion: number
  state: string
  userId: string
}

export async function ensureApplicationIdentity(
  runtimePool: Pool,
  authSubjectId: string,
  displayName: string,
): Promise<ApplicationIdentity> {
  await runtimePool.query("SELECT app.register_auth_subject($1, $2)", [
    authSubjectId,
    displayName,
  ])
  const result = await runtimePool.query<{
    session_version: number
    user_id: string
    user_state: string
  }>("SELECT * FROM app.resolve_auth_subject($1)", [authSubjectId])
  const identity = result.rows[0]

  if (identity === undefined) {
    throw new Error("Application identity mapping failed")
  }

  return {
    sessionVersion: identity.session_version,
    state: identity.user_state,
    userId: identity.user_id,
  }
}
