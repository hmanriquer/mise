import { z } from "zod"
import { CHANNEL, type Channel } from "./channel"
import type { EnumValue } from "./enum-values"

export const PAYMENT_METHOD = {
  cash: "cash",
  cardTerminal: "card_terminal",
  didiFood: "didi_food",
} as const

export const paymentMethodSchema = z.enum(PAYMENT_METHOD)

export type PaymentMethod = EnumValue<typeof PAYMENT_METHOD>

// There is no payment gateway: counter sales are cash or the owner's own terminal,
// and DiDi Food has already charged the customer.
export const ALLOWED_PAYMENTS_BY_CHANNEL = {
  [CHANNEL.counter]: [PAYMENT_METHOD.cash, PAYMENT_METHOD.cardTerminal],
  [CHANNEL.didiFood]: [PAYMENT_METHOD.didiFood],
} as const satisfies Record<Channel, readonly PaymentMethod[]>

export function isPaymentAllowedForChannel(
  channel: Channel,
  paymentMethod: PaymentMethod,
): boolean {
  const allowed: readonly PaymentMethod[] = ALLOWED_PAYMENTS_BY_CHANNEL[channel]
  return allowed.includes(paymentMethod)
}
