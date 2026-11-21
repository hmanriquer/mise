import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert02Icon,
  ArrowRight01Icon,
  ChartHistogramIcon,
  ShoppingCart01Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"

import { PrinterChip, SyncChip } from "@/components/status-chips"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import {
  OWNER_NAME,
  QUEUED_TICKETS,
  TICKETS_TODAY,
  TODAY_OFFLINE,
  TODAY_ONLINE,
  type Ticket,
} from "@/lib/data"
import { money, TODAY_LONG } from "@/lib/format"
import { navigate } from "@/lib/nav"

function channelLabel(ticket: Ticket) {
  return ticket.channel === "didi" ? "DiDi Food" : "Mostrador"
}

export function HomeScreen({ offline }: { offline: boolean }) {
  const kpis = offline ? TODAY_OFFLINE : TODAY_ONLINE
  const tickets = offline ? [...QUEUED_TICKETS, ...TICKETS_TODAY] : TICKETS_TODAY

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-sm" data-contrast="home-kicker">
            {TODAY_LONG}
          </p>
          <h1 className="font-heading text-2xl font-semibold" data-contrast="home-title">
            Hola, {OWNER_NAME}
          </h1>
        </div>
        <Button
          className="min-h-14 min-w-56 px-6 text-base"
          data-contrast="nueva-venta"
          onClick={() => navigate("/vender")}
        >
          <HugeiconsIcon icon={ShoppingCart01Icon} strokeWidth={2} data-icon="inline-start" />
          Nueva venta
        </Button>
      </div>

      {offline ? (
        <Alert data-contrast="offline-alert">
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
          <AlertTitle>Sin conexión</AlertTitle>
          <AlertDescription>
            Las ventas se guardan en este dispositivo y se sincronizan después. La impresora
            sigue disponible.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Kpi label="Ventas de hoy" value={money.format(kpis.sales)} />
        <Kpi label="Pedidos" value={String(kpis.orders)} />
        <Kpi label="Ticket promedio" value={money.format(kpis.average)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <CardHeader>
            <CardTitle>Últimos tickets</CardTitle>
            <CardDescription data-contrast="tickets-desc">
              Folios de hoy en este dispositivo, del más reciente al más antiguo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ItemGroup>
              {tickets.map((ticket) => (
                <Item key={ticket.folio} size="sm" className="min-h-11">
                  <ItemContent>
                    <ItemTitle>
                      <span className="tabular-nums">{ticket.folio}</span>
                      {ticket.queued ? (
                        <Badge variant="outline" className="ml-2">
                          En cola
                        </Badge>
                      ) : null}
                    </ItemTitle>
                    <ItemDescription data-contrast="ticket-meta">
                      {channelLabel(ticket)} · {ticket.payment} · {ticket.summary}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions className="flex flex-col items-end gap-0.5">
                    <span className="tabular-nums font-medium">{money.format(ticket.total)}</span>
                    <span className="text-muted-foreground tabular-nums text-xs" data-contrast="ticket-time">
                      {ticket.time}
                    </span>
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Estado del dispositivo</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <SyncChip offline={offline} queued={offline ? 3 : 0} />
                <PrinterChip ready />
              </div>
              <p className="text-muted-foreground text-sm" data-contrast="status-help">
                {offline
                  ? "Hay 3 ventas esperando a sincronizarse. Puedes seguir cobrando e imprimiendo."
                  : "La cola está vacía y la impresora POS58C3 está lista para el ticket de cliente y el de cocina."}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Atajos</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="min-h-11 justify-between"
                onClick={() => navigate("/tablero")}
              >
                <span className="flex items-center gap-2">
                  <HugeiconsIcon icon={ChartHistogramIcon} strokeWidth={2} data-icon="inline-start" />
                  Ver tablero
                </span>
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} data-icon="inline-end" />
              </Button>
              <Button variant="outline" className="min-h-11 justify-between">
                <span className="flex items-center gap-2">
                  <HugeiconsIcon icon={Wallet01Icon} strokeWidth={2} data-icon="inline-start" />
                  Registrar gasto
                </span>
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} data-icon="inline-end" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription data-contrast="kpi-label">{label}</CardDescription>
        <CardTitle className="font-heading text-2xl tabular-nums" data-contrast="kpi-value">
          {value}
        </CardTitle>
      </CardHeader>
    </Card>
  )
}
