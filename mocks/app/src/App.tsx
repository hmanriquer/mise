import { useEffect, useState } from "react"

import { AppShell } from "@/components/app-shell"
import { applyShellDataset, parseRoute } from "@/lib/nav"
import { DashboardScreen } from "@/screens/dashboard-screen"
import { HomeScreen } from "@/screens/home-screen"
import { LoginScreen } from "@/screens/login-screen"
import { SellScreen } from "@/screens/sell-screen"

export default function App() {
  const [route, setRoute] = useState(() => parseRoute())

  useEffect(() => {
    const sync = () => setRoute(parseRoute())
    window.addEventListener("popstate", sync)
    return () => window.removeEventListener("popstate", sync)
  }, [])

  useEffect(() => {
    applyShellDataset(route.shell)
  }, [route.shell])

  if (route.screen === "login") {
    return <LoginScreen password={route.password} />
  }

  const tablet = route.shell === "tablet"
  const queued = route.offline ? 3 : 0

  return (
    <AppShell
      active={route.screen}
      offline={route.offline}
      queued={queued}
      printerReady
      tablet={tablet}
    >
      {route.screen === "tablero" ? (
        <DashboardScreen />
      ) : route.screen === "vender" ? (
        <SellScreen tablet={tablet} pickerOpen={route.picker} cobroOpen={route.cobro} didi={route.didi} />
      ) : (
        <HomeScreen offline={route.offline} />
      )}
    </AppShell>
  )
}
