import { OfferingSetup } from "../../../components/offering-setup"
import { SetupContextRequired } from "../../../components/setup-context-required"
import { SetupShell } from "../../../components/setup-shell"

interface OfferingsPageProps {
  searchParams: Promise<{
    businessId?: string
    venueId?: string
  }>
}

export default async function OfferingsPage({
  searchParams,
}: OfferingsPageProps) {
  const { businessId, venueId } = await searchParams

  return (
    <SetupShell businessId={businessId} title="Offerings" venueId={venueId}>
      {businessId === undefined || venueId === undefined ? (
        <SetupContextRequired />
      ) : (
        <OfferingSetup businessId={businessId} venueId={venueId} />
      )}
    </SetupShell>
  )
}
