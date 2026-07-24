export interface LocalSchedulePeriod {
  closesAt: string
  crossesMidnight: boolean
  opensAt: string
}

export interface WeeklyLocalSchedulePeriod extends LocalSchedulePeriod {
  weekday: number
}

export interface LocalScheduleException {
  kind: "CLOSED" | "REPLACE"
  localDate: string
  periods: LocalSchedulePeriod[]
}

export interface FixedSlot {
  endAt: string
  localEnd: string
  localStart: string
  startAt: string
}

interface LocalDateParts {
  day: number
  hour: number
  minute: number
  month: number
  second: number
  year: number
}

export class ScheduleRuleError extends Error {
  readonly code = "SCHEDULE_RULE_VIOLATION"
  override readonly name = "ScheduleRuleError"

  constructor(message: string) {
    super(message)
  }
}

const localDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/
const localTimePattern = /^([01]\d|2[0-3]):([0-5]\d)$/
const weekMinutes = 7 * 24 * 60

function parseLocalDate(
  value: string,
): Omit<LocalDateParts, "hour" | "minute" | "second"> {
  const match = localDatePattern.exec(value)
  if (match === null) {
    throw new ScheduleRuleError("Operational date must use YYYY-MM-DD.")
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new ScheduleRuleError("Operational date is not a valid date.")
  }

  return { day, month, year }
}

function parseLocalTime(value: string): { hour: number; minute: number } {
  const match = localTimePattern.exec(value)
  if (match === null) {
    throw new ScheduleRuleError("Schedule times must use 24-hour HH:mm.")
  }

  return { hour: Number(match[1]), minute: Number(match[2]) }
}

function addLocalDays(value: string, days: number): string {
  const parts = parseLocalDate(value)
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days))
  return [
    date.getUTCFullYear().toString().padStart(4, "0"),
    (date.getUTCMonth() + 1).toString().padStart(2, "0"),
    date.getUTCDate().toString().padStart(2, "0"),
  ].join("-")
}

function toLocalDateParts(date: string, time: string): LocalDateParts {
  const dateParts = parseLocalDate(date)
  const timeParts = parseLocalTime(time)
  return { ...dateParts, ...timeParts, second: 0 }
}

function localEpoch(parts: LocalDateParts): number {
  return Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  )
}

function zonedParts(
  epochMilliseconds: number,
  timezone: string,
): LocalDateParts {
  let formatter: Intl.DateTimeFormat
  try {
    formatter = new Intl.DateTimeFormat("en-CA-u-ca-iso8601", {
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
      minute: "2-digit",
      month: "2-digit",
      second: "2-digit",
      timeZone: timezone,
      year: "numeric",
    })
  } catch {
    throw new ScheduleRuleError("Schedule timezone must be a valid IANA zone.")
  }

  const values = Object.fromEntries(
    formatter
      .formatToParts(new Date(epochMilliseconds))
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, Number(value)]),
  )

  return {
    day: values.day!,
    hour: values.hour!,
    minute: values.minute!,
    month: values.month!,
    second: values.second!,
    year: values.year!,
  }
}

export function assertIanaTimezone(timezone: string): void {
  zonedParts(Date.now(), timezone)
}

function equalLocalParts(
  first: LocalDateParts,
  second: LocalDateParts,
): boolean {
  return (
    first.year === second.year &&
    first.month === second.month &&
    first.day === second.day &&
    first.hour === second.hour &&
    first.minute === second.minute &&
    first.second === second.second
  )
}

function possibleInstants(parts: LocalDateParts, timezone: string): number[] {
  const targetEpoch = localEpoch(parts)
  const offsets = new Set<number>()

  for (let hours = -48; hours <= 48; hours += 6) {
    const probe = targetEpoch + hours * 60 * 60 * 1000
    offsets.add(localEpoch(zonedParts(probe, timezone)) - probe)
  }

  const candidates = new Set<number>()
  for (const offset of offsets) {
    const candidate = targetEpoch - offset
    if (equalLocalParts(zonedParts(candidate, timezone), parts)) {
      candidates.add(candidate)
    }
  }

  return [...candidates].sort((first, second) => first - second)
}

function resolveBoundary(
  date: string,
  time: string,
  timezone: string,
  boundary: "OPEN" | "CLOSE",
): number {
  const candidates = possibleInstants(toLocalDateParts(date, time), timezone)
  if (candidates.length === 0) {
    throw new ScheduleRuleError(
      `${date} ${time} does not exist in ${timezone} because of a timezone transition.`,
    )
  }

  return boundary === "OPEN" ? candidates[0]! : candidates.at(-1)!
}

function offsetText(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? "+" : "-"
  const magnitude = Math.abs(offsetMinutes)
  const hours = Math.floor(magnitude / 60)
  const minutes = magnitude % 60
  return `${sign}${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`
}

function formatLocalInstant(
  epochMilliseconds: number,
  timezone: string,
): string {
  const parts = zonedParts(epochMilliseconds, timezone)
  const offsetMinutes = Math.round(
    (localEpoch(parts) - epochMilliseconds) / 60_000,
  )
  return [
    parts.year.toString().padStart(4, "0"),
    "-",
    parts.month.toString().padStart(2, "0"),
    "-",
    parts.day.toString().padStart(2, "0"),
    "T",
    parts.hour.toString().padStart(2, "0"),
    ":",
    parts.minute.toString().padStart(2, "0"),
    ":",
    parts.second.toString().padStart(2, "0"),
    offsetText(offsetMinutes),
  ].join("")
}

function localMinuteRange(period: LocalSchedulePeriod, dayOffset = 0) {
  const opens = parseLocalTime(period.opensAt)
  const closes = parseLocalTime(period.closesAt)
  const start = dayOffset * 1440 + opens.hour * 60 + opens.minute
  let end = dayOffset * 1440 + closes.hour * 60 + closes.minute

  if (period.crossesMidnight) end += 1440

  if (end <= start) {
    throw new ScheduleRuleError(
      "A schedule period must end after it opens; mark a next-day close as cross-midnight.",
    )
  }

  return { end, start }
}

function rangesOverlap(
  first: { end: number; start: number },
  second: { end: number; start: number },
): boolean {
  return first.start < second.end && second.start < first.end
}

export function assertScheduleDefinition(
  weeklyPeriods: readonly WeeklyLocalSchedulePeriod[],
  exceptions: readonly LocalScheduleException[],
): void {
  if (weeklyPeriods.length === 0) {
    throw new ScheduleRuleError(
      "A schedule version requires at least one weekly period.",
    )
  }

  const weeklyRanges = weeklyPeriods.map((period) => {
    if (
      !Number.isInteger(period.weekday) ||
      period.weekday < 1 ||
      period.weekday > 7
    ) {
      throw new ScheduleRuleError("Schedule weekday must be from 1 to 7.")
    }
    return {
      ...localMinuteRange(period, period.weekday - 1),
      weekday: period.weekday,
    }
  })

  for (let first = 0; first < weeklyRanges.length; first += 1) {
    for (let second = first + 1; second < weeklyRanges.length; second += 1) {
      for (const shift of [-weekMinutes, 0, weekMinutes]) {
        const shifted = {
          end: weeklyRanges[second]!.end + shift,
          start: weeklyRanges[second]!.start + shift,
        }
        if (rangesOverlap(weeklyRanges[first]!, shifted)) {
          throw new ScheduleRuleError("Weekly schedule periods cannot overlap.")
        }
      }
    }
  }

  const exceptionDates = new Set<string>()
  for (const exception of exceptions) {
    parseLocalDate(exception.localDate)
    if (exceptionDates.has(exception.localDate)) {
      throw new ScheduleRuleError(
        "A schedule version can contain only one exception per date.",
      )
    }
    exceptionDates.add(exception.localDate)

    if (exception.kind === "CLOSED" && exception.periods.length !== 0) {
      throw new ScheduleRuleError(
        "A closed schedule exception cannot contain periods.",
      )
    }
    if (exception.kind === "REPLACE" && exception.periods.length === 0) {
      throw new ScheduleRuleError(
        "A replacement schedule exception requires a period.",
      )
    }

    const ranges = exception.periods.map((period) => localMinuteRange(period))
    for (let first = 0; first < ranges.length; first += 1) {
      for (let second = first + 1; second < ranges.length; second += 1) {
        if (rangesOverlap(ranges[first]!, ranges[second]!)) {
          throw new ScheduleRuleError(
            "Schedule exception periods cannot overlap.",
          )
        }
      }
    }
  }
}

export function isoWeekday(localDate: string): number {
  const parts = parseLocalDate(localDate)
  const weekday = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day),
  ).getUTCDay()
  return weekday === 0 ? 7 : weekday
}

export function effectivePeriodsForDate(
  operationalDate: string,
  weeklyPeriods: readonly WeeklyLocalSchedulePeriod[],
  exceptions: readonly LocalScheduleException[],
): LocalSchedulePeriod[] {
  parseLocalDate(operationalDate)
  const exception = exceptions.find(
    ({ localDate }) => localDate === operationalDate,
  )

  if (exception?.kind === "CLOSED") return []
  if (exception?.kind === "REPLACE") return [...exception.periods]

  const weekday = isoWeekday(operationalDate)
  return weeklyPeriods
    .filter((period) => period.weekday === weekday)
    .map(({ closesAt, crossesMidnight, opensAt }) => ({
      closesAt,
      crossesMidnight,
      opensAt,
    }))
}

export function generateFixedSlots(input: {
  durationMinutes: number
  operationalDate: string
  periods: readonly LocalSchedulePeriod[]
  timezone: string
}): FixedSlot[] {
  if (
    !Number.isInteger(input.durationMinutes) ||
    input.durationMinutes < 1 ||
    input.durationMinutes > 1440
  ) {
    throw new ScheduleRuleError(
      "Fixed slot duration must be from 1 to 1440 whole minutes.",
    )
  }

  parseLocalDate(input.operationalDate)
  assertIanaTimezone(input.timezone)

  const periodRanges = input.periods
    .map((period) => {
      localMinuteRange(period)
      const closingDate = period.crossesMidnight
        ? addLocalDays(input.operationalDate, 1)
        : input.operationalDate
      const start = resolveBoundary(
        input.operationalDate,
        period.opensAt,
        input.timezone,
        "OPEN",
      )
      const end = resolveBoundary(
        closingDate,
        period.closesAt,
        input.timezone,
        "CLOSE",
      )
      if (end <= start) {
        throw new ScheduleRuleError(
          "A resolved schedule period must end after it opens.",
        )
      }
      return { end, start }
    })
    .sort((first, second) => first.start - second.start)

  for (let index = 1; index < periodRanges.length; index += 1) {
    if (periodRanges[index]!.start < periodRanges[index - 1]!.end) {
      throw new ScheduleRuleError("Effective schedule periods cannot overlap.")
    }
  }

  const durationMilliseconds = input.durationMinutes * 60_000
  const slots: FixedSlot[] = []
  for (const period of periodRanges) {
    for (
      let start = period.start;
      start + durationMilliseconds <= period.end;
      start += durationMilliseconds
    ) {
      const end = start + durationMilliseconds
      slots.push({
        endAt: new Date(end).toISOString(),
        localEnd: formatLocalInstant(end, input.timezone),
        localStart: formatLocalInstant(start, input.timezone),
        startAt: new Date(start).toISOString(),
      })
    }
  }

  return slots
}
