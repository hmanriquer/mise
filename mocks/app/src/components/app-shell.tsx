import type { ReactNode } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ChartHistogramIcon,
  Home01Icon,
  Logout03Icon,
  MenuRestaurantIcon,
  Settings01Icon,
  ShoppingCart01Icon,
  SpadesIcon,
  Store01Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"

import { PrinterChip, SyncChip } from "@/components/status-chips"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { BUSINESS_NAME, DEVICE_LABEL, OWNER_NAME, TAGLINE } from "@/lib/data"
import { TODAY_LABEL } from "@/lib/format"
import { hrefFor, navigate, type Screen } from "@/lib/nav"

const NAV = [
  { id: "inicio" as const, label: "Inicio", path: "/", icon: Home01Icon },
  { id: "vender" as const, label: "Vender", path: "/vender", icon: ShoppingCart01Icon },
  { id: "pedidos" as const, label: "Pedidos", path: "#pedidos", icon: Store01Icon, soon: true },
  { id: "gastos" as const, label: "Gastos", path: "#gastos", icon: Wallet01Icon, soon: true },
  { id: "tablero" as const, label: "Tablero", path: "/tablero", icon: ChartHistogramIcon },
  { id: "catalogo" as const, label: "Catálogo", path: "#catalogo", icon: MenuRestaurantIcon, soon: true },
  { id: "ajustes" as const, label: "Ajustes", path: "#ajustes", icon: Settings01Icon, soon: true },
]

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <HugeiconsIcon icon={SpadesIcon} strokeWidth={2} />
      </div>
      {compact ? null : (
        <div className="flex min-w-0 flex-col">
          <span className="font-heading truncate text-sm font-semibold">{BUSINESS_NAME}</span>
          <span className="text-muted-foreground truncate text-xs" data-contrast="tagline">
            {TAGLINE}
          </span>
        </div>
      )}
    </div>
  )
}

function AccountMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="min-h-11 gap-2 px-2" />
        }
      >
        <Avatar className="size-8">
          <AvatarFallback>E</AvatarFallback>
        </Avatar>
        <span className="hidden max-w-[10rem] truncate text-sm sm:inline">{OWNER_NAME}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{OWNER_NAME}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <HugeiconsIcon icon={Logout03Icon} strokeWidth={2} />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NavList({ active }: { active: Screen }) {
  return (
    <SidebarMenu>
      {NAV.map((item) => (
        <SidebarMenuItem key={item.id}>
          <SidebarMenuButton
            isActive={item.id === active}
            className="min-h-11"
            render={
              item.soon ? (
                <span />
              ) : (
                <a
                  href={hrefFor(item.path)}
                  onClick={(event) => {
                    event.preventDefault()
                    navigate(item.path)
                  }}
                />
              )
            }
          >
            <HugeiconsIcon icon={item.icon} strokeWidth={2} />
            <span>{item.label}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

export function AppShell({
  active,
  offline,
  queued = 0,
  printerReady = true,
  tablet = false,
  children,
}: {
  active: Screen
  offline: boolean
  queued?: number
  printerReady?: boolean
  tablet?: boolean
  children: ReactNode
}) {
  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <Sidebar variant="inset" collapsible="offcanvas">
        <SidebarHeader className="gap-3 p-4">
          <BrandMark />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <NavList active={active} />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <p className="text-muted-foreground px-2 text-xs" data-contrast="device-label">
            {DEVICE_LABEL}
          </p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="min-h-0 min-w-0 overflow-hidden">
        <header className="flex min-h-14 shrink-0 items-center gap-3 border-b px-4">
          {tablet ? <SidebarTrigger className="min-h-11 min-w-11" /> : null}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {tablet ? (
              <div className="min-w-0">
                <BrandMark />
              </div>
            ) : (
              <p className="text-muted-foreground truncate text-sm" data-contrast="date-label">
                {TODAY_LABEL}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <SyncChip offline={offline} queued={queued} />
            <PrinterChip ready={printerReady} />
            <Separator orientation="vertical" className="hidden h-6 sm:block" />
            <AccountMenu />
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
