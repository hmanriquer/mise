import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { WEEK } from "@/lib/data"
import { money } from "@/lib/format"

const chartConfig = {
  ventas: { label: "Ventas", color: "var(--chart-2)" },
  gastos: { label: "Gastos", color: "var(--chart-4)" },
} satisfies ChartConfig

function Delta({ value }: { value: number }) {
  const label = `${value > 0 ? "+" : ""}${value}%`
  return (
    <Badge variant="secondary" className="tabular-nums">
      {label}
    </Badge>
  )
}

export function DashboardScreen() {
  const chartData = WEEK.days.map((day) => ({
    label: day.label,
    ventas: day.future ? 0 : day.ventas,
    gastos: day.future ? 0 : day.gastos,
  }))

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold">Tablero</h1>
          <p className="text-muted-foreground text-sm" data-contrast="period-label">
            {WEEK.label}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup
            variant="outline"
            spacing={0}
            value={["semana"]}
            className="min-h-11"
          >
            <ToggleGroupItem value="dia" className="min-h-11 px-4">
              Día
            </ToggleGroupItem>
            <ToggleGroupItem value="semana" className="min-h-11 px-4">
              Semana
            </ToggleGroupItem>
            <ToggleGroupItem value="mes" className="min-h-11 px-4">
              Mes
            </ToggleGroupItem>
          </ToggleGroup>
          <Button variant="outline" size="icon" className="min-h-11 min-w-11">
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
            <span className="sr-only">Periodo anterior</span>
          </Button>
          <Button variant="outline" size="icon" className="min-h-11 min-w-11">
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
            <span className="sr-only">Periodo siguiente</span>
          </Button>
          <Button variant="outline" className="min-h-11">
            <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} data-icon="inline-start" />
            Ir a una fecha
          </Button>
        </div>
      </div>

      <Alert data-contrast="coverage-alert">
        <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
        <AlertTitle>Margen estimado sobre el 72% de las ventas con costo registrado</AlertTitle>
        <AlertDescription>
          El margen usa {money.format(WEEK.coveredSales)} de {money.format(WEEK.ventas)} en ventas.
          Hay {WEEK.variantsWithoutCost} productos sin costo. Complétalos en Catálogo para un margen más preciso.
        </AlertDescription>
      </Alert>

      <div className="grid gap-3 grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        <Kpi label="Ventas" value={money.format(WEEK.ventas)} delta={WEEK.deltas.ventas} />
        <Kpi label="Gastos" value={money.format(WEEK.gastos)} delta={WEEK.deltas.gastos} />
        <Kpi label="Costo estimado" value={money.format(WEEK.costoEstimado)} delta={WEEK.deltas.costoEstimado} />
        <Kpi label="Margen estimado" value={money.format(WEEK.margenEstimado)} delta={WEEK.deltas.margenEstimado} />
        <Kpi label="Flujo del periodo" value={money.format(WEEK.flujo)} delta={WEEK.deltas.flujo} />
        <Kpi label="Pedidos" value={String(WEEK.pedidos)} delta={WEEK.deltas.pedidos} />
        <Kpi label="Ticket promedio" value={money.format(WEEK.ticketPromedio)} delta={WEEK.deltas.ticketPromedio} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Ventas y gastos</CardTitle>
            <CardDescription>Por día de la semana. Sábado y domingo todavía no tienen movimiento.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="aspect-auto h-44 w-full">
              <BarChart data={chartData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("es-MX", {
                      style: "currency",
                      currency: "MXN",
                      maximumFractionDigits: 0,
                    }).format(Number(value))
                  }
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="ventas" fill="var(--color-ventas)" radius={6} />
                <Bar dataKey="gastos" fill="var(--color-gastos)" radius={6} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card size="sm" className="h-full">
          <CardHeader>
            <CardTitle>Cómo se vendió</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <BreakdownList title="Por canal" rows={WEEK.channels} />
            <BreakdownList title="Por método de pago" rows={WEEK.payments} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Productos más vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Piezas</TableHead>
                  <TableHead className="text-right">Ventas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {WEEK.topProducts.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.qty}</TableCell>
                    <TableCell className="text-right tabular-nums">{money.format(row.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Insumos por consumir (estimado)</CardTitle>
            <CardDescription data-contrast="insumos-desc">
              Compras de insumos y empaques menos el costo estimado de lo vendido, en todo el historial.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="font-heading text-3xl tabular-nums" data-contrast="insumos-value">
              {money.format(WEEK.insumosPorConsumir)}
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gastos de la semana</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {WEEK.expenses.map((row) => (
                  <TableRow key={row.label}>
                    <TableCell>{row.label}</TableCell>
                    <TableCell className="text-right tabular-nums">{money.format(row.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Kpi({ label, value, delta }: { label: string; value: string; delta: number }) {
  return (
    <Card size="sm">
      <CardHeader className="gap-1">
        <div className="flex items-start justify-between gap-2">
          <CardDescription data-contrast="dash-kpi-label">{label}</CardDescription>
          <Delta value={delta} />
        </div>
        <CardTitle className="font-heading text-xl tabular-nums" data-contrast="dash-kpi-value">
          {value}
        </CardTitle>
      </CardHeader>
    </Card>
  )
}

function BreakdownList({
  title,
  rows,
}: {
  title: string
  rows: { id: string; label: string; amount: number; pct: number }[]
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-heading text-sm font-medium">{title}</h3>
      {rows.map((row) => (
        <div key={row.id} className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm">{row.label}</span>
            <span className="text-muted-foreground text-xs tabular-nums" data-contrast="breakdown-pct">
              {row.pct.toLocaleString("es-MX")}%
            </span>
          </div>
          <span className="tabular-nums text-sm font-medium">{money.format(row.amount)}</span>
        </div>
      ))}
    </div>
  )
}
