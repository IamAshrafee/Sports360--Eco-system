import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowLeft, Boxes, CalendarClock, PackageOpen } from "lucide-react"

import { Badge } from "@sports/ui/components/badge"
import { buttonVariants } from "@sports/ui/components/button"

interface SetupShellProps {
  businessId: string | undefined
  children: ReactNode
  title: string
  venueId: string | undefined
}

function setupHref(
  path: string,
  businessId: string | undefined,
  venueId: string | undefined,
): string {
  const query = new URLSearchParams()
  if (businessId !== undefined) query.set("businessId", businessId)
  if (venueId !== undefined) query.set("venueId", venueId)
  const suffix = query.toString()
  return suffix.length === 0 ? path : `${path}?${suffix}`
}

export function SetupShell({
  businessId,
  children,
  title,
  venueId,
}: SetupShellProps) {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="border-border space-y-5 border-b pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <Link
              className="text-muted-foreground focus-visible:ring-ring/50 inline-flex min-h-11 items-center gap-2 text-sm underline-offset-4 hover:underline focus-visible:rounded-md focus-visible:ring-3 focus-visible:outline-none"
              href={setupHref("/setup", businessId, venueId)}
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Setup overview
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h1>
          </div>
          <Badge variant="secondary">Phase 5 · Configuration</Badge>
        </div>

        <nav aria-label="Setup sections" className="flex flex-wrap gap-2">
          <Link
            className={buttonVariants({
              className: "min-h-11",
              variant: "outline",
            })}
            href={setupHref("/setup/resources", businessId, venueId)}
          >
            <Boxes aria-hidden="true" />
            Activities & resources
          </Link>
          <Link
            className={buttonVariants({
              className: "min-h-11",
              variant: "outline",
            })}
            href={setupHref("/setup/offerings", businessId, venueId)}
          >
            <PackageOpen aria-hidden="true" />
            Offerings
          </Link>
          <Link
            className={buttonVariants({
              className: "min-h-11",
              variant: "outline",
            })}
            href={setupHref("/setup/schedule", businessId, venueId)}
          >
            <CalendarClock aria-hidden="true" />
            Schedule & slots
          </Link>
        </nav>
      </header>

      <div className="py-6">{children}</div>
    </main>
  )
}
