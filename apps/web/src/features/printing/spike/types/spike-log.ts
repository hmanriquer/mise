export interface SpikeLogEntry {
  id: number
  message: string
  detail: string | null
}

export type LogSpikeEvent = (message: string, detail?: unknown) => void

export type Clock = () => number
