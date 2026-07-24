import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Button } from "./button"

describe("Button", () => {
  it("renders an accessible button and handles activation", async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={onClick}>Book a slot</Button>)
    await user.click(screen.getByRole("button", { name: "Book a slot" }))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it("prevents activation while disabled", async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()

    render(
      <Button disabled onClick={onClick}>
        Unavailable
      </Button>,
    )
    await user.click(screen.getByRole("button", { name: "Unavailable" }))

    expect(onClick).not.toHaveBeenCalled()
  })
})
