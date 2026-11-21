import { HugeiconsIcon } from "@hugeicons/react"
import {
  CloudOffIcon,
  CloudSyncIcon,
  PrinterCheckIcon,
  PrinterOffIcon,
} from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function SyncChip({ offline, queued = 0 }: { offline: boolean; queued?: number }) {
  if (offline) {
    const label =
      queued > 0
        ? `Sin conexión · ${queued} ${queued === 1 ? "venta" : "ventas"} en cola`
        : "Sin conexión"
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Badge
              variant="outline"
              data-contrast="sync-offline"
              className="h-8 max-w-full gap-1.5 px-3 text-xs font-medium"
            />
          }
        >
          <HugeiconsIcon icon={CloudOffIcon} strokeWidth={2} data-icon="inline-start" />
          {label}
        </TooltipTrigger>
        <TooltipContent>
          Las ventas se guardan en este dispositivo y se sincronizan al volver la conexión.
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Badge
            variant="secondary"
            data-contrast="sync-ok"
            className="h-8 gap-1.5 px-3 text-xs font-medium"
          />
        }
      >
        <HugeiconsIcon icon={CloudSyncIcon} strokeWidth={2} data-icon="inline-start" />
        Sincronizado
      </TooltipTrigger>
      <TooltipContent>Todo está al día con el servidor.</TooltipContent>
    </Tooltip>
  )
}

export function PrinterChip({ ready = true }: { ready?: boolean }) {
  if (!ready) {
    return (
      <Badge
        variant="outline"
        data-contrast="printer-off"
        className="h-8 gap-1.5 px-3 text-xs font-medium"
      >
        <HugeiconsIcon icon={PrinterOffIcon} strokeWidth={2} data-icon="inline-start" />
        Sin impresora
      </Badge>
    )
  }

  return (
    <Badge
      variant="secondary"
      data-contrast="printer-ok"
      className="h-8 gap-1.5 px-3 text-xs font-medium"
    >
      <HugeiconsIcon icon={PrinterCheckIcon} strokeWidth={2} data-icon="inline-start" />
      Impresora lista
    </Badge>
  )
}
