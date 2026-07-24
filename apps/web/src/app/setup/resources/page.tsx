import { ResourceSetup } from "../../../components/resource-setup"
import { SetupContextRequired } from "../../../components/setup-context-required"
import { SetupShell } from "../../../components/setup-shell"

interface ResourcesPageProps {
  searchParams: Promise<{
    businessId?: string
    venueId?: string
  }>
}

export default async function ResourcesPage({
  searchParams,
}: ResourcesPageProps) {
  const { businessId, venueId } = await searchParams

  return (
    <SetupShell
      businessId={businessId}
      title="Activities & resources"
      venueId={venueId}
    >
      {businessId === undefined || venueId === undefined ? (
        <SetupContextRequired />
      ) : (
        <ResourceSetup businessId={businessId} venueId={venueId} />
      )}
    </SetupShell>
  )
}
