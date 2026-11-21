import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert02Icon,
  Delete02Icon,
  FrenchFries01Icon,
  HotdogIcon,
  InformationCircleIcon,
  MinusSignIcon,
  PlusSignIcon,
  SoftDrink01Icon,
} from "@hugeicons/core-free-icons"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  BANDERILLA_PRICES,
  BEBIDAS,
  CART_ITEMS,
  CART_TOTAL,
  PAPAS,
  RELLENOS,
  SABORES,
} from "@/lib/data"
import { money } from "@/lib/format"

const CASH_PRESETS = ["Exacto", "$50", "$100", "$200", "$500"] as const

function ProductGrid({ pickerOpen }: { pickerOpen: boolean }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <ProductTile
        icon={HotdogIcon}
        name="Banderilla"
        priceLabel="Desde $15.00"
        active={pickerOpen}
      />
      {PAPAS.map((item) => (
        <ProductTile
          key={item.id}
          icon={FrenchFries01Icon}
          name={item.name}
          priceLabel={money.format(item.price)}
        />
      ))}
      {BEBIDAS.map((item) => (
        <ProductTile
          key={item.id}
          icon={SoftDrink01Icon}
          name={item.name}
          priceLabel={money.format(item.price)}
        />
      ))}
    </div>
  )
}

export function SellScreen({
  tablet,
  pickerOpen,
  cobroOpen,
  didi = false,
}: {
  tablet: boolean
  pickerOpen: boolean
  cobroOpen: boolean
  didi?: boolean
}) {
  const [sabor, setSabor] = useState("coreana")
  const prices = BANDERILLA_PRICES[sabor] ?? BANDERILLA_PRICES.coreana
  const channel = didi ? "didi" : "mostrador"
  const defaultTab = pickerOpen ? "banderillas" : "todas"

  const picker = (
    <div className="flex flex-col gap-6">
      <FieldGroup>
        <Field>
          <FieldLabel>Sabor</FieldLabel>
          <ToggleGroup
            variant="outline"
            spacing={0}
            value={[sabor]}
            onValueChange={(value) => {
              if (value[0]) setSabor(value[0])
            }}
            className="flex w-full flex-wrap"
          >
            {SABORES.map((item) => (
              <ToggleGroupItem
                key={item.id}
                value={item.id}
                className="min-h-11 flex-1 px-3"
              >
                {item.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>
        <Field>
          <FieldLabel>Relleno</FieldLabel>
          <ToggleGroup variant="outline" className="grid w-full grid-cols-2 gap-2 sm:grid-cols-5" spacing={2}>
            {RELLENOS.map((item, index) => (
              <ToggleGroupItem
                key={item.id}
                value={item.id}
                className="h-auto min-h-14 flex-col gap-0.5 px-2 py-2"
              >
                <span>{item.label}</span>
                <span className="tabular-nums text-xs font-medium" data-contrast="variant-price">
                  {money.format(prices[index] ?? 0)}
                </span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <p className="text-muted-foreground text-xs" data-contrast="picker-hint">
            Elige el relleno para agregar al carrito.
          </p>
        </Field>
      </FieldGroup>
    </div>
  )

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-4 lg:flex-row lg:p-6">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-heading text-2xl font-semibold">Vender</h1>
          <ToggleGroup variant="outline" spacing={0} value={[channel]} className="min-h-11">
            <ToggleGroupItem value="mostrador" className="min-h-11 px-4">
              Mostrador
            </ToggleGroupItem>
            <ToggleGroupItem value="didi" className="min-h-11 px-4">
              DiDi Food
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {didi ? (
          <Alert data-contrast="didi-banner">
            <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} />
            <AlertTitle>Precios de ejemplo</AlertTitle>
            <AlertDescription>
              Los precios de DiDi Food son de ejemplo hasta que confirmes la lista en Catálogo.
              Por ahora se muestran los mismos que en Mostrador.
            </AlertDescription>
          </Alert>
        ) : null}

        <Tabs defaultValue={defaultTab} className="flex min-h-0 flex-1 flex-col gap-4">
          <TabsList className="h-auto min-h-11 w-full justify-start">
            <TabsTrigger value="todas" className="min-h-11 flex-1">
              Todas
            </TabsTrigger>
            <TabsTrigger value="banderillas" className="min-h-11 flex-1">
              Banderillas
            </TabsTrigger>
            <TabsTrigger value="papas" className="min-h-11 flex-1">
              Papas
            </TabsTrigger>
            <TabsTrigger value="bebidas" className="min-h-11 flex-1">
              Bebidas
            </TabsTrigger>
          </TabsList>
          <TabsContent value="todas" className="min-h-0 overflow-auto">
            <ProductGrid pickerOpen={pickerOpen} />
          </TabsContent>
          <TabsContent value="banderillas" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <ProductTile
              icon={HotdogIcon}
              name="Banderilla"
              priceLabel="Desde $15.00"
              active={pickerOpen}
            />
          </TabsContent>
          <TabsContent value="papas" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {PAPAS.map((item) => (
              <ProductTile
                key={item.id}
                icon={FrenchFries01Icon}
                name={item.name}
                priceLabel={money.format(item.price)}
              />
            ))}
          </TabsContent>
          <TabsContent value="bebidas" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {BEBIDAS.map((item) => (
              <ProductTile
                key={item.id}
                icon={SoftDrink01Icon}
                name={item.name}
                priceLabel={money.format(item.price)}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <CartPanel didi={didi} />

      {tablet ? (
        <Drawer open={pickerOpen} showSwipeHandle>
          <DrawerContent initialFocus={false}>
            <DrawerHeader>
              <DrawerTitle>Banderilla</DrawerTitle>
              <DrawerDescription>
                Elige el sabor y el relleno. Al completar, se agrega al carrito.
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-6">{picker}</div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={pickerOpen}>
          <DialogContent className="sm:max-w-xl" showCloseButton initialFocus={false}>
            <DialogHeader>
              <DialogTitle>Banderilla</DialogTitle>
              <DialogDescription>
                Elige el sabor y el relleno. Al completar, se agrega al carrito.
              </DialogDescription>
            </DialogHeader>
            {picker}
            {!tablet ? (
              <p className="text-muted-foreground text-xs" data-contrast="kbd-hint">
                <Kbd>Esc</Kbd> cierra el selector.
              </p>
            ) : null}
          </DialogContent>
        </Dialog>
      )}

      <CheckoutDialog open={cobroOpen} didi={didi} />
    </div>
  )
}

function ProductTile({
  icon,
  name,
  priceLabel,
  active = false,
}: {
  icon: typeof HotdogIcon
  name: string
  priceLabel: string
  active?: boolean
}) {
  return (
    <Card
      size="sm"
      role="button"
      tabIndex={0}
      data-active={active ? "true" : undefined}
      className="min-h-28 cursor-pointer transition-colors hover:bg-muted/60 data-[active=true]:ring-2 data-[active=true]:ring-ring"
    >
      <CardHeader className="flex flex-row items-start gap-3">
        <div className="bg-muted flex size-11 items-center justify-center rounded-xl">
          <HugeiconsIcon icon={icon} strokeWidth={2} />
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <CardTitle>{name}</CardTitle>
          <CardDescription className="tabular-nums" data-contrast="tile-price">
            {priceLabel}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  )
}

function CartPanel({ didi }: { didi: boolean }) {
  return (
    <Card className="flex w-full shrink-0 flex-col lg:w-96">
      <CardHeader>
        <CardTitle>Carrito</CardTitle>
        <CardDescription>{didi ? "DiDi Food" : "Mostrador"} · 2 productos</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {CART_ITEMS.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.name}</p>
              {item.variant ? (
                <p className="text-muted-foreground truncate text-xs" data-contrast="cart-variant">
                  {item.variant}
                </p>
              ) : null}
              <p className="tabular-nums text-sm">{money.format(item.unit)}</p>
            </div>
            <div className="flex items-center gap-2">
              <ButtonGroup>
                <Button variant="outline" size="icon" className="min-h-11 min-w-11">
                  <HugeiconsIcon icon={MinusSignIcon} strokeWidth={2} />
                  <span className="sr-only">Quitar una</span>
                </Button>
                <Button variant="outline" className="min-h-11 min-w-11 tabular-nums" disabled>
                  {item.qty}
                </Button>
                <Button variant="outline" size="icon" className="min-h-11 min-w-11">
                  <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                  <span className="sr-only">Agregar una</span>
                </Button>
              </ButtonGroup>
              <Button variant="ghost" size="icon" className="min-h-11 min-w-11">
                <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                <span className="sr-only">Quitar del carrito</span>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex flex-col gap-3 border-t">
        <div className="flex w-full items-center justify-between">
          <span className="text-muted-foreground text-sm" data-contrast="cart-total-label">
            Total
          </span>
          <span className="font-heading text-xl tabular-nums font-semibold" data-contrast="cart-total">
            {money.format(CART_TOTAL)}
          </span>
        </div>
        <Button className="min-h-11 w-full" data-contrast="cobrar-cta">
          {didi ? `Registrar ${money.format(CART_TOTAL)}` : `Cobrar ${money.format(CART_TOTAL)}`}
        </Button>
      </CardFooter>
    </Card>
  )
}

function CheckoutDialog({ open, didi }: { open: boolean; didi: boolean }) {
  return (
    <Dialog open={open}>
      <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-3xl" initialFocus={false}>
        <DialogHeader>
          <DialogTitle>{didi ? "Registrar pedido DiDi" : "Cobrar pedido"}</DialogTitle>
          <DialogDescription>
            {didi
              ? "Se imprime solo el ticket de cocina. Si no hay conexión, la venta queda en cola y el ticket se imprime igual."
              : "Se imprime el ticket de cliente y el de cocina. Si no hay conexión, la venta queda en cola y el ticket se imprime igual."}
          </DialogDescription>
        </DialogHeader>
        {didi ? (
          <Alert data-contrast="didi-manual-alert">
            <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
            <AlertTitle>Registro manual</AlertTitle>
            <AlertDescription>
              Sin conexión con DiDi Food. Captura el pedido aquí para tu control; DiDi no se actualiza.
            </AlertDescription>
          </Alert>
        ) : null}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h3 className="font-heading text-sm font-medium">Productos</h3>
            {CART_ITEMS.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {item.name}
                    {item.variant ? ` · ${item.variant}` : ""}
                  </p>
                  <p className="text-muted-foreground tabular-nums text-xs">
                    {item.qty} × {money.format(item.unit)}
                  </p>
                </div>
                <ButtonGroup>
                  <Button variant="outline" size="icon" className="min-h-11 min-w-11">
                    <HugeiconsIcon icon={MinusSignIcon} strokeWidth={2} />
                    <span className="sr-only">Quitar una</span>
                  </Button>
                  <Button variant="outline" className="min-h-11 min-w-11 tabular-nums" disabled>
                    {item.qty}
                  </Button>
                  <Button variant="outline" size="icon" className="min-h-11 min-w-11">
                    <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                    <span className="sr-only">Agregar una</span>
                  </Button>
                </ButtonGroup>
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm">Total</span>
              <span className="font-heading text-2xl tabular-nums font-semibold" data-contrast="cobro-total">
                {money.format(CART_TOTAL)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Método de pago</FieldLabel>
                {didi ? (
                  <ToggleGroup variant="outline" spacing={0} value={["didi"]} className="w-full">
                    <ToggleGroupItem value="didi" className="min-h-11 flex-1">
                      DiDi Food
                    </ToggleGroupItem>
                  </ToggleGroup>
                ) : (
                  <ToggleGroup variant="outline" spacing={0} value={["efectivo"]} className="w-full">
                    <ToggleGroupItem value="efectivo" className="min-h-11 flex-1">
                      Efectivo
                    </ToggleGroupItem>
                    <ToggleGroupItem value="terminal" className="min-h-11 flex-1">
                      Terminal propia
                    </ToggleGroupItem>
                  </ToggleGroup>
                )}
              </Field>
              {didi ? (
                <Field>
                  <FieldLabel htmlFor="folio-didi">Folio DiDi</FieldLabel>
                  <Input
                    id="folio-didi"
                    className="min-h-11"
                    placeholder="Opcional, ej. 45821"
                    defaultValue=""
                    data-contrast="folio-didi"
                  />
                </Field>
              ) : (
                <>
                  <Field>
                    <FieldLabel htmlFor="recibido">Recibido</FieldLabel>
                    <InputGroup className="min-h-11">
                      <InputGroupAddon>
                        <InputGroupText>$</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        id="recibido"
                        inputMode="decimal"
                        defaultValue="100.00"
                        className="min-h-11 tabular-nums"
                        data-contrast="recibido"
                      />
                    </InputGroup>
                    <div className="flex flex-wrap gap-2">
                      {CASH_PRESETS.map((preset) => (
                        <Button
                          key={preset}
                          type="button"
                          variant={preset === "$100" ? "secondary" : "outline"}
                          className="min-h-11"
                        >
                          {preset}
                        </Button>
                      ))}
                    </div>
                  </Field>
                  <div className="bg-muted flex items-center justify-between rounded-2xl px-4 py-3">
                    <span className="text-sm">Cambio</span>
                    <span className="font-heading text-2xl tabular-nums font-semibold" data-contrast="cambio">
                      {money.format(15)}
                    </span>
                  </div>
                </>
              )}
              <Field>
                <FieldLabel htmlFor="cliente">Nombre del cliente</FieldLabel>
                <Input
                  id="cliente"
                  className="min-h-11"
                  placeholder="Para llamar el pedido"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="nota">Nota para cocina</FieldLabel>
                <Textarea id="nota" placeholder="Opcional" />
              </Field>
            </FieldGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="min-h-11">
            Volver al carrito
          </Button>
          <Button className="min-h-11" data-contrast="confirmar-cta">
            {didi ? "Registrar venta DiDi e imprimir" : "Cobrar e imprimir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
