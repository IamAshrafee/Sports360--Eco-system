import { ArrowRight, CalendarDays, MapPin, ShieldCheck } from "lucide-react"
import Link from "next/link"

import { Badge } from "@sports/ui/components/badge"
import { Button } from "@sports/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sports/ui/components/card"

const foundations = [
  {
    description:
      "Separate web, API, and worker processes in one typed workspace.",
    icon: ShieldCheck,
    title: "Correct by design",
  },
  {
    description: "Bangladesh-first time, currency, phone, and venue workflows.",
    icon: MapPin,
    title: "Local from day one",
  },
  {
    description: "One availability engine for staff and customer bookings.",
    icon: CalendarDays,
    title: "One operational truth",
  },
]

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      <nav
        aria-label="Primary navigation"
        className="border-border flex items-center justify-between border-b pb-5"
      >
        <div>
          <p className="text-sm font-semibold tracking-tight">
            Sports Venue Management
          </p>
          <p className="text-muted-foreground text-xs">
            Engineering foundation
          </p>
        </div>
        <Badge variant="secondary">Phase 5 active</Badge>
      </nav>

      <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-7">
          <Badge variant="outline">Bangladesh-first · API-first</Badge>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              The daily operating system for sports venues.
            </h1>
            <p className="text-muted-foreground max-w-2xl text-base leading-7 sm:text-lg">
              Resources, availability, bookings, customers, payments, and daily
              operations—built around one reliable source of truth.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="min-h-11"
              render={<Link href="/setup" />}
              size="lg"
            >
              Start venue setup
              <ArrowRight aria-hidden="true" data-icon="inline-end" />
            </Button>
            <Button size="lg" variant="outline">
              Review architecture
            </Button>
          </div>
        </div>

        <div className="grid gap-4" aria-label="Engineering principles">
          {foundations.map(({ description, icon: Icon, title }) => (
            <Card key={title}>
              <CardHeader className="flex-row items-start gap-4">
                <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <div className="space-y-1">
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="sr-only">
                Phase 4 implementation principle
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
