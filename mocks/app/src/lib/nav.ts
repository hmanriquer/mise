export type Screen = "login" | "inicio" | "tablero" | "vender"

export type MockRoute = {
  screen: Screen
  shell: "pc" | "tablet"
  offline: boolean
  picker: boolean
  cobro: boolean
  password: boolean
  didi: boolean
}

export function parseRoute(path = window.location.pathname, search = window.location.search): MockRoute {
  const params = new URLSearchParams(search)
  const shell = params.get("shell") === "tablet" ? "tablet" : "pc"
  const offline = params.get("offline") === "1"
  const picker = params.get("picker") === "1"
  const cobro = params.get("cobro") === "1"
  const password = params.get("password") === "1"
  const didi = params.get("didi") === "1"

  let screen: Screen = "inicio"
  if (path === "/login" || path === "/entrar") screen = "login"
  else if (path === "/tablero") screen = "tablero"
  else if (path === "/vender") screen = "vender"
  else screen = "inicio"

  return { screen, shell, offline, picker, cobro, password, didi }
}

export function hrefFor(path: string, extras: Record<string, string | undefined> = {}) {
  const url = new URL(path, window.location.origin)
  const current = new URLSearchParams(window.location.search)
  if (current.get("shell")) {
    url.searchParams.set("shell", current.get("shell")!)
  }
  for (const [key, value] of Object.entries(extras)) {
    if (value === undefined) url.searchParams.delete(key)
    else url.searchParams.set(key, value)
  }
  const q = url.searchParams.toString()
  return url.pathname + (q ? `?${q}` : "")
}

export function navigate(path: string, extras: Record<string, string | undefined> = {}) {
  const href = hrefFor(path, extras)
  window.history.pushState({}, "", href)
  window.dispatchEvent(new PopStateEvent("popstate"))
}

export function applyShellDataset(shell: "pc" | "tablet") {
  if (shell === "tablet") {
    document.documentElement.dataset.shell = "tablet"
  } else {
    delete document.documentElement.dataset.shell
  }
}
