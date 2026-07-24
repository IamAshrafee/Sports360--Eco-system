import { ScheduleSetup } from "../../../components/schedule-setup"
import { SetupContextRequired } from "../../../components/setup-context-required"
import { SetupShell } from "../../../components/setup-shell"

interface SchedulePageProps {
  searchParams: Promise<{
    businessId?: string
    venueId?: string
  }>
}

export default async function SchedulePage({
  searchParams,
}: SchedulePageProps) {
  const { businessId, venueId } = await searchParams

  return (
    <SetupShell
      businessId={businessId}
      title="Schedule & fixed slots"
      venueId={venueId}
    >
      {businessId === undefined || venueId === undefined ? (
        <SetupContextRequired />
      ) : (
        <ScheduleSetup businessId={businessId} venueId={venueId} />
      )}
    </SetupShell>
  )
}
