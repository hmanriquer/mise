// Injected so services and tests control time and identifiers.
export interface Clock {
  now(): number
}

export interface IdGenerator {
  next(): string
}
