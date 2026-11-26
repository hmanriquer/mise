import { describe, expect, it } from "vitest"
import { CHANNEL } from "../enums/channel"
import { countsAsSupplies, EXPENSE_CATEGORY } from "../enums/expense-category"
import {
  ALLOWED_PAYMENTS_BY_CHANNEL,
  isPaymentAllowedForChannel,
  PAYMENT_METHOD,
  paymentMethodSchema,
} from "../enums/payment-method"

describe("ALLOWED_PAYMENTS_BY_CHANNEL", () => {
  it("lets the counter take cash and the owner's terminal", () => {
    expect(ALLOWED_PAYMENTS_BY_CHANNEL[CHANNEL.counter]).toEqual([
      PAYMENT_METHOD.cash,
      PAYMENT_METHOD.cardTerminal,
    ])
  })

  it("fixes DiDi Food to the DiDi Food payment", () => {
    expect(ALLOWED_PAYMENTS_BY_CHANNEL[CHANNEL.didiFood]).toEqual([PAYMENT_METHOD.didiFood])
  })

  it.each([
    [CHANNEL.counter, PAYMENT_METHOD.didiFood],
    [CHANNEL.didiFood, PAYMENT_METHOD.cash],
    [CHANNEL.didiFood, PAYMENT_METHOD.cardTerminal],
  ])("rejects %s paid with %s", (channel, paymentMethod) => {
    expect(isPaymentAllowedForChannel(channel, paymentMethod)).toBe(false)
  })
})

describe("paymentMethodSchema", () => {
  it("rejects an unknown method", () => {
    expect(paymentMethodSchema.safeParse("transfer").success).toBe(false)
  })
})

describe("countsAsSupplies", () => {
  it.each([
    [EXPENSE_CATEGORY.supplies, true],
    [EXPENSE_CATEGORY.packaging, true],
    [EXPENSE_CATEGORY.utilities, false],
    [EXPENSE_CATEGORY.other, false],
  ])("treats %s as supplies: %s", (category, expected) => {
    expect(countsAsSupplies(category)).toBe(expected)
  })
})
