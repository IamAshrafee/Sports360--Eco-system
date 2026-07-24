import { mkdtemp, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { describe, expect, it, vi } from "vitest"

import { runMigrations } from "./migrations.js"

describe("runMigrations", () => {
  it("rejects a changed migration checksum", async () => {
    const directory = await mkdtemp(join(tmpdir(), "sports-migrations-"))
    await writeFile(join(directory, "001_example.sql"), "SELECT 1;\n")

    const query = vi
      .fn()
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({
        rows: [{ checksum: "different", name: "001_example.sql" }],
      })
      .mockResolvedValueOnce({})

    const client = {
      query,
      release: vi.fn(),
    }
    const pool = {
      connect: vi.fn().mockResolvedValue(client),
    }

    await expect(runMigrations(pool as never, directory)).rejects.toThrowError(
      "has changed",
    )
    expect(client.release).toHaveBeenCalledOnce()
  })
})
