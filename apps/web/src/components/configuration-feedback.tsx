"use client"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@sports/ui/components/alert"
import { Button } from "@sports/ui/components/button"

export interface ConfigurationFeedback {
  code: string
  message: string
}

export function ConfigurationErrorNotice({
  error,
  onRetry,
}: {
  error: ConfigurationFeedback
  onRetry?: () => void
}) {
  const stale = error.code === "STALE_VERSION"
  const forbidden = error.code === "FORBIDDEN"

  return (
    <Alert variant="destructive">
      <AlertTitle>
        {stale
          ? "Configuration changed"
          : forbidden
            ? "Permission required"
            : "Could not save configuration"}
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p>
          {stale
            ? "Someone saved a newer version. Reload the latest values before trying again."
            : forbidden
              ? "An Owner or Manager with configuration access must complete this action."
              : error.message}
        </p>
        {onRetry === undefined || forbidden ? null : (
          <Button
            className="min-h-11"
            onClick={onRetry}
            type="button"
            variant="outline"
          >
            Reload and try again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
