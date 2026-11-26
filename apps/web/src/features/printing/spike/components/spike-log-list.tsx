import { PRINTING_SPIKE_COPY } from "../constants/copy"
import type { SpikeLogEntry } from "../types/spike-log"

interface SpikeLogListProps {
  entries: SpikeLogEntry[]
}

export function SpikeLogList({ entries }: SpikeLogListProps) {
  return (
    <section aria-labelledby="spike-log-title" className="flex flex-col gap-2">
      <h2 id="spike-log-title" className="font-heading text-lg font-semibold">
        {PRINTING_SPIKE_COPY.log.title}
      </h2>
      {entries.length === 0 ? (
        <p className="text-muted-foreground">{PRINTING_SPIKE_COPY.log.empty}</p>
      ) : (
        <ol className="flex flex-col gap-2 font-mono text-sm">
          {entries.map((entry) => (
            <li key={entry.id} className="rounded-md border p-2">
              <p>{entry.message}</p>
              {entry.detail === null ? null : (
                <pre className="overflow-x-auto whitespace-pre-wrap">{entry.detail}</pre>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
