import { describe, expect, it } from "vitest"
import {
  COMPONENT_MAX_LINES,
  countNonBlankLines,
  FILE_MAX_LINES,
  findViolations,
  lineLimitFor,
} from "../scripts/lib/line-limits.mjs"

describe("countNonBlankLines", () => {
  it("ignores lines that are empty or only whitespace", () => {
    expect(countNonBlankLines("a\n\n  \nb\n")).toBe(2)
  })
})

describe("lineLimitFor", () => {
  it("limits component .tsx files to the component maximum", () => {
    expect(lineLimitFor("apps/web/src/features/x/components/a.tsx")).toBe(COMPONENT_MAX_LINES)
  })

  it("limits other source files to the file maximum", () => {
    expect(lineLimitFor("apps/web/src/features/x/helpers/a.ts")).toBe(FILE_MAX_LINES)
  })

  it("applies the file maximum to tests", () => {
    expect(lineLimitFor("apps/web/src/features/x/__tests__/a.test.tsx")).toBe(FILE_MAX_LINES)
  })

  it("exempts generated shadcn components", () => {
    expect(lineLimitFor("packages/ui/src/components/sidebar.tsx")).toBeNull()
  })

  it("exempts generated route trees", () => {
    expect(lineLimitFor("apps/web/src/app/routeTree.gen.ts")).toBeNull()
  })
})

describe("findViolations", () => {
  it("reports a file over its limit", () => {
    expect(findViolations([{ path: "a.tsx", text: "x\n".repeat(151) }])).toEqual([
      { path: "a.tsx", lines: 151, limit: 150 },
    ])
  })

  it("accepts a file exactly at its limit", () => {
    expect(findViolations([{ path: "a.tsx", text: "x\n".repeat(150) }])).toEqual([])
  })

  it("skips exempt files", () => {
    expect(
      findViolations([{ path: "packages/ui/src/components/sidebar.tsx", text: "x\n".repeat(900) }]),
    ).toEqual([])
  })
})
