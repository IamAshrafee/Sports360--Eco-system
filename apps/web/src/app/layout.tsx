import type { Metadata } from "next"

import "./globals.css"

export const metadata: Metadata = {
  description:
    "Bangladesh-first operations and booking management for sports venues.",
  title: {
    default: "Sports Venue Management",
    template: "%s · Sports Venue Management",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
