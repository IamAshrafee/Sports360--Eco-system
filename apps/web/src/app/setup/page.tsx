import Link from "next/link"
import { ArrowRight, Boxes, CalendarClock, PackageOpen } from "lucide-react"

import { Badge } from "@sports/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sports/ui/components/card"

import { SetupContextRequired } from "../../components/setup-context-required"
import { SetupShell } from "../../components/setup-shell"

interface SetupPageProps {
  searchParams: Promise<{
    businessId?: string
    venueId?: string
  }>
}

export default async function SetupPage({ searchParams }: SetupPageProps) {
  const { businessId, venueId } = await searchParams
  const hasContext = businessId !== undefined && venueId !== undefined

  return (
    <SetupShell businessId={businessId} title="Venue setup" venueId={venueId}>
      {hasContext ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <Badge variant="outline">3 configuration sections</Badge>
            <p className="text-muted-foreground max-w-2xl leading-7">
              Create the playable resources first, then connect them to
              fixed-duration offerings, then define effective schedules and
              preview fixed slots. Prices remain a later step.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SetupCard
              description="Create tenant-owned activities and independent playable spaces."
              href={`/setup/resources?businessId=${businessId}&venueId=${venueId}`}
              icon={<Boxes aria-hidden="true" className="size-5" />}
              title="Activities & resources"
            />
            <SetupCard
              description="Connect an activity, duration, and compatible active resources."
              href={`/setup/offerings?businessId=${businessId}&venueId=${venueId}`}
              icon={<PackageOpen aria-hidden="true" className="size-5" />}
              title="Offerings"
            />
            <SetupCard
              description="Define venue or resource hours, exceptions, and preview fixed internal slots."
              href={`/setup/schedule?businessId=${businessId}&venueId=${venueId}`}
              icon={<CalendarClock aria-hidden="true" className="size-5" />}
              title="Schedule & slots"
            />
          </div>
        </div>
      ) : (
        <SetupContextRequired />
      )}
    </SetupShell>
  )
}

function SetupCard({
  description,
  href,
  icon,
  title,
}: {
  description: string
  href: string
  icon: React.ReactNode
  title: string
}) {
  return (
    <Card>
      <CardHeader>
        <div className="bg-secondary mb-2 flex size-10 items-center justify-center rounded-lg">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          className="text-primary focus-visible:ring-ring/50 inline-flex min-h-11 items-center gap-2 font-medium underline-offset-4 hover:underline focus-visible:rounded-md focus-visible:ring-3 focus-visible:outline-none"
          href={href}
        >
          Configure
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </CardContent>
    </Card>
  )
}
