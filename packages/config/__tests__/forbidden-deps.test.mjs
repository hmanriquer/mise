import { describe, expect, it } from "vitest"
import { findForbiddenDependencies } from "../scripts/lib/forbidden-deps.mjs"

const PATH = "apps/web/package.json"

describe("findForbiddenDependencies", () => {
  it("flags a Radix dependency", () => {
    const manifests = [{ path: PATH, json: { dependencies: { "@radix-ui/react-dialog": "1" } } }]
    expect(findForbiddenDependencies(manifests)).toEqual([
      { path: PATH, name: "@radix-ui/react-dialog" },
    ])
  })

  it("flags a Lucide dev dependency", () => {
    const manifests = [{ path: PATH, json: { devDependencies: { "lucide-react": "1" } } }]
    expect(findForbiddenDependencies(manifests)).toEqual([{ path: PATH, name: "lucide-react" }])
  })

  it("flags forbidden peer and optional dependencies", () => {
    const manifests = [
      {
        path: PATH,
        json: {
          peerDependencies: { "radix-ui": "1" },
          optionalDependencies: { "Lucide-Icons": "1" },
        },
      },
    ]
    expect(findForbiddenDependencies(manifests)).toEqual([
      { path: PATH, name: "radix-ui" },
      { path: PATH, name: "Lucide-Icons" },
    ])
  })

  it("accepts the approved libraries", () => {
    const manifests = [
      { path: PATH, json: { dependencies: { "@base-ui/react": "1", "@hugeicons/react": "1" } } },
    ]
    expect(findForbiddenDependencies(manifests)).toEqual([])
  })
})
