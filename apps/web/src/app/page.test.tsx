import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import HomePage from "./page"

describe("HomePage", () => {
  it("communicates the product and current engineering phase", () => {
    render(<HomePage />)

    expect(
      screen.getByRole("heading", {
        name: "The daily operating system for sports venues.",
      }),
    ).toBeInTheDocument()
    expect(screen.getByText("Phase 4")).toBeInTheDocument()
  })
})
