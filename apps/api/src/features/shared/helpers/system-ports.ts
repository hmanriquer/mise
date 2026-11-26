import type { Clock, IdGenerator } from "../types/ports"

export const systemClock: Clock = { now: () => Date.now() }

export const randomIdGenerator: IdGenerator = { next: () => crypto.randomUUID() }
