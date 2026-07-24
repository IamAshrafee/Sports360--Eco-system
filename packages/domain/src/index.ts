import { v7 as uuidv7, validate as validateUuid } from "uuid"

declare const opaqueIdBrand: unique symbol

export type OpaqueId = string & { readonly [opaqueIdBrand]: true }

export function createOpaqueId(): OpaqueId {
  return uuidv7() as OpaqueId
}

export function parseOpaqueId(value: string): OpaqueId {
  if (!validateUuid(value)) {
    throw new TypeError("Expected an opaque UUID")
  }

  return value as OpaqueId
}
