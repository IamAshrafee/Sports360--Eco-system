import { describe, expect, it } from "vitest"

import {
  assertScheduleDefinition,
  effectivePeriodsForDate,
  generateFixedSlots,
  isoWeekday,
  ScheduleRuleError,
} from "./schedule.js"

describe("schedule rules", () => {
  it("generates adjacent half-open fixed slots and discards a remainder", () => {
    const slots = generateFixedSlots({
      durationMinutes: 60,
      operationalDate: "2026-07-27",
      periods: [
        {
          closesAt: "10:30",
          crossesMidnight: false,
          opensAt: "08:00",
        },
      ],
      timezone: "Asia/Dhaka",
    })

    expect(slots).toHaveLength(2)
    expect(slots[0]).toEqual({
      endAt: "2026-07-27T03:00:00.000Z",
      localEnd: "2026-07-27T09:00:00+06:00",
      localStart: "2026-07-27T08:00:00+06:00",
      startAt: "2026-07-27T02:00:00.000Z",
    })
    expect(slots[0]!.endAt).toBe(slots[1]!.startAt)
    expect(slots[1]!.localEnd).toBe("2026-07-27T10:00:00+06:00")
  })

  it("keeps a cross-midnight period on its opening operational date", () => {
    const slots = generateFixedSlots({
      durationMinutes: 60,
      operationalDate: "2026-07-24",
      periods: [
        {
          closesAt: "02:00",
          crossesMidnight: true,
          opensAt: "22:00",
        },
      ],
      timezone: "Asia/Dhaka",
    })

    expect(slots).toHaveLength(4)
    expect(slots[0]!.localStart).toBe("2026-07-24T22:00:00+06:00")
    expect(slots.at(-1)!.localEnd).toBe("2026-07-25T02:00:00+06:00")
  })

  it("handles a non-Dhaka forward DST gap with exact elapsed durations", () => {
    const slots = generateFixedSlots({
      durationMinutes: 60,
      operationalDate: "2026-03-08",
      periods: [
        {
          closesAt: "04:00",
          crossesMidnight: false,
          opensAt: "00:00",
        },
      ],
      timezone: "America/New_York",
    })

    expect(slots).toHaveLength(3)
    expect(
      slots.map(({ localStart, localEnd }) => [localStart, localEnd]),
    ).toEqual([
      ["2026-03-08T00:00:00-05:00", "2026-03-08T01:00:00-05:00"],
      ["2026-03-08T01:00:00-05:00", "2026-03-08T03:00:00-04:00"],
      ["2026-03-08T03:00:00-04:00", "2026-03-08T04:00:00-04:00"],
    ])
  })

  it("handles a non-Dhaka backward DST fold deterministically", () => {
    const slots = generateFixedSlots({
      durationMinutes: 60,
      operationalDate: "2026-11-01",
      periods: [
        {
          closesAt: "04:00",
          crossesMidnight: false,
          opensAt: "00:00",
        },
      ],
      timezone: "America/New_York",
    })

    expect(slots).toHaveLength(5)
    expect(slots[1]!.localStart).toBe("2026-11-01T01:00:00-04:00")
    expect(slots[1]!.localEnd).toBe("2026-11-01T01:00:00-05:00")
    expect(slots[2]!.localStart).toBe("2026-11-01T01:00:00-05:00")
  })

  it("rejects a boundary that falls inside a DST gap", () => {
    expect(() =>
      generateFixedSlots({
        durationMinutes: 30,
        operationalDate: "2026-03-08",
        periods: [
          {
            closesAt: "04:00",
            crossesMidnight: false,
            opensAt: "02:30",
          },
        ],
        timezone: "America/New_York",
      }),
    ).toThrow(ScheduleRuleError)
  })

  it("rejects weekly overlap across midnight and permits adjacency", () => {
    expect(() =>
      assertScheduleDefinition(
        [
          {
            closesAt: "02:00",
            crossesMidnight: true,
            opensAt: "22:00",
            weekday: 7,
          },
          {
            closesAt: "03:00",
            crossesMidnight: false,
            opensAt: "01:00",
            weekday: 1,
          },
        ],
        [],
      ),
    ).toThrow("Weekly schedule periods cannot overlap.")

    expect(() =>
      assertScheduleDefinition(
        [
          {
            closesAt: "02:00",
            crossesMidnight: true,
            opensAt: "22:00",
            weekday: 7,
          },
          {
            closesAt: "03:00",
            crossesMidnight: false,
            opensAt: "02:00",
            weekday: 1,
          },
        ],
        [],
      ),
    ).not.toThrow()
  })

  it("uses closed and replacement exceptions before weekly periods", () => {
    const weekly = [
      {
        closesAt: "10:00",
        crossesMidnight: false,
        opensAt: "08:00",
        weekday: 1,
      },
    ]
    expect(isoWeekday("2026-07-27")).toBe(1)
    expect(
      effectivePeriodsForDate("2026-07-27", weekly, [
        {
          kind: "CLOSED",
          localDate: "2026-07-27",
          periods: [],
        },
      ]),
    ).toEqual([])

    expect(
      effectivePeriodsForDate("2026-07-27", weekly, [
        {
          kind: "REPLACE",
          localDate: "2026-07-27",
          periods: [
            {
              closesAt: "14:00",
              crossesMidnight: false,
              opensAt: "12:00",
            },
          ],
        },
      ]),
    ).toEqual([
      {
        closesAt: "14:00",
        crossesMidnight: false,
        opensAt: "12:00",
      },
    ])
  })

  it("rejects malformed exception shapes and duplicate dates", () => {
    const weekly = [
      {
        closesAt: "10:00",
        crossesMidnight: false,
        opensAt: "08:00",
        weekday: 1,
      },
    ]

    expect(() =>
      assertScheduleDefinition(weekly, [
        {
          kind: "CLOSED",
          localDate: "2026-07-27",
          periods: [
            {
              closesAt: "14:00",
              crossesMidnight: false,
              opensAt: "12:00",
            },
          ],
        },
      ]),
    ).toThrow("closed schedule exception")

    expect(() =>
      assertScheduleDefinition(weekly, [
        {
          kind: "CLOSED",
          localDate: "2026-07-27",
          periods: [],
        },
        {
          kind: "CLOSED",
          localDate: "2026-07-27",
          periods: [],
        },
      ]),
    ).toThrow("only one exception per date")
  })
})
