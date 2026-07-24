import type { ActorContext, PermissionCode } from "@sports/contracts"

export class AuthorizationError extends Error {
  readonly code = "FORBIDDEN"
  override readonly name = "AuthorizationError"

  constructor(message = "The requested action is not permitted.") {
    super(message)
  }
}

export function requirePermission(
  actor: ActorContext,
  permission: PermissionCode,
): void {
  if (!actor.permissions.includes(permission)) {
    throw new AuthorizationError()
  }
}

export function requireVenueAccess(actor: ActorContext, venueId: string): void {
  if (!actor.businessWide && !actor.allowedVenueIds.includes(venueId)) {
    throw new AuthorizationError("The venue is outside this staff scope.")
  }
}
