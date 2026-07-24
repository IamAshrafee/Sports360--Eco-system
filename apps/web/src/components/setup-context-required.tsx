import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@sports/ui/components/alert"
import { Button } from "@sports/ui/components/button"
import { Input } from "@sports/ui/components/input"
import { Label } from "@sports/ui/components/label"

export function SetupContextRequired() {
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Alert>
        <AlertTitle>Select a business and venue</AlertTitle>
        <AlertDescription>
          This foundation expects authenticated navigation to provide opaque
          business and venue identifiers. Enter them here to open the setup
          workflow directly.
        </AlertDescription>
      </Alert>

      <form className="space-y-4" method="get">
        <div className="space-y-2">
          <Label htmlFor="businessId">Business ID</Label>
          <Input
            id="businessId"
            name="businessId"
            pattern="[0-9a-fA-F-]{36}"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="venueId">Venue ID</Label>
          <Input
            id="venueId"
            name="venueId"
            pattern="[0-9a-fA-F-]{36}"
            required
          />
        </div>
        <Button className="min-h-11 w-full sm:w-auto" type="submit">
          Open setup
        </Button>
      </form>
    </div>
  )
}
