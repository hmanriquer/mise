import { describe, expect, it } from "vitest"
import { inlineSqlParams, toSqlLiteral } from "../seed/inline-sql-params"

describe("inlineSqlParams", () => {
  it("writes each parameter in place of its placeholder", () => {
    expect(inlineSqlParams('insert into "t" values (?, ?, ?)', ["Flamin' Hot", 1500, null])).toBe(
      "insert into \"t\" values ('Flamin'' Hot', 1500, NULL)",
    )
  })

  it("rejects a parameter count that does not match the placeholders", () => {
    expect(() => inlineSqlParams("values (?, ?)", ["only one"])).toThrow()
  })
})

describe("toSqlLiteral", () => {
  it("doubles single quotes so a value cannot end the string", () => {
    expect(toSqlLiteral("'); drop table order; --")).toBe("'''); drop table order; --'")
  })

  it.each([Number.NaN, Number.POSITIVE_INFINITY, undefined, true, {}])("rejects %s", (value) => {
    expect(() => toSqlLiteral(value)).toThrow()
  })
})
