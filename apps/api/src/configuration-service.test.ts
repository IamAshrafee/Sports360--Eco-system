import { AuthorizationError } from "@sports/authorization"
import { describe, expect, it, vi } from "vitest"

import { createConfigurationService } from "./configuration-service.js"

const businessId = "019b7000-0000-7000-8000-000000000001"

describe("configuration service authorization", () => {
  it("denies a Finance/Reports API mutation before protected data is read", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        rows: [
          {
            access_version: 0,
            allowed_venue_ids: [],
            business_id: businessId,
            business_wide: true,
            membership_id: "019b7000-0000-7000-8000-000000000101",
            permissions: ["resource.read", "report.financial"],
            profile_code: "FINANCE_REPORTS",
            session_version: 0,
            user_id: "019b7000-0000-7000-8000-000000000011",
          },
        ],
      })
      .mockResolvedValueOnce({})
    const client = { query, release: vi.fn() }
    const pool = {
      connect: vi.fn().mockResolvedValue(client),
    }
    const service = createConfigurationService(pool as never)

    await expect(
      service.createActivity(
        {
          authSubjectId: "finance-subject",
          businessId,
          correlationId: "finance-direct-api-proof",
          sessionVersion: 0,
        },
        {
          code: "forbidden",
          displayName: "Forbidden",
          state: "ACTIVE",
        },
      ),
    ).rejects.toBeInstanceOf(AuthorizationError)

    expect(
      query.mock.calls.some(([statement]) =>
        String(statement).includes("INSERT INTO app.activities"),
      ),
    ).toBe(false)
    expect(query).toHaveBeenLastCalledWith("ROLLBACK")
  })

  it("denies a Finance/Reports schedule mutation before schedule data is read", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        rows: [
          {
            access_version: 0,
            allowed_venue_ids: [],
            business_id: businessId,
            business_wide: true,
            membership_id: "019b7000-0000-7000-8000-000000000101",
            permissions: ["resource.read", "report.financial"],
            profile_code: "FINANCE_REPORTS",
            session_version: 0,
            user_id: "019b7000-0000-7000-8000-000000000011",
          },
        ],
      })
      .mockResolvedValueOnce({})
    const client = { query, release: vi.fn() }
    const pool = {
      connect: vi.fn().mockResolvedValue(client),
    }
    const service = createConfigurationService(pool as never)

    await expect(
      service.createScheduleVersion(
        {
          authSubjectId: "finance-subject",
          businessId,
          correlationId: "finance-schedule-direct-api-proof",
          sessionVersion: 0,
        },
        "019b7000-0000-7000-8000-000000000201",
        {
          effectiveFrom: "2026-07-27",
          exceptions: [],
          weeklyPeriods: [
            {
              closesAt: "23:00",
              crossesMidnight: false,
              opensAt: "08:00",
              weekday: 1,
            },
          ],
        },
      ),
    ).rejects.toBeInstanceOf(AuthorizationError)

    expect(
      query.mock.calls.some(([statement]) =>
        String(statement).includes("app.schedule_versions"),
      ),
    ).toBe(false)
    expect(query).toHaveBeenLastCalledWith("ROLLBACK")
  })
})
