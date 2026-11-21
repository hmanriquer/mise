export type Channel = "mostrador" | "didi"

export const SABORES = [
  { id: "sencilla", label: "Sencilla" },
  { id: "flamin-hot", label: "Flamin' Hot" },
  { id: "flamin-blue", label: "Flamin' Blue" },
  { id: "coreana", label: "Coreana" },
] as const

export const RELLENOS = [
  { id: "mini-salchicha", label: "Mini Salchicha" },
  { id: "mini-queso", label: "Mini Queso" },
  { id: "salchicha", label: "Salchicha" },
  { id: "combinada", label: "Combinada" },
  { id: "queso", label: "Queso" },
] as const

/** Counter prices in MXN. DiDi placeholders copy these. */
export const BANDERILLA_PRICES: Record<string, number[]> = {
  sencilla: [15, 22, 25, 32, 40],
  "flamin-hot": [25, 32, 35, 42, 50],
  "flamin-blue": [25, 32, 35, 42, 50],
  coreana: [30, 37, 40, 47, 55],
}

export const PAPAS = [
  { id: "francesa", name: "A la francesa", price: 45 },
  { id: "preparadas", name: "Preparadas", price: 60 },
] as const

export const BEBIDAS = [
  { id: "refresco", name: "Refresco", price: 30 },
  { id: "soda-italiana", name: "Soda italiana", price: 40 },
  { id: "mojito", name: "Mojito virgen", price: 40 },
  { id: "sunset", name: "Sunset", price: 45 },
  { id: "cafe-ole", name: "Café Olé", price: 38 },
  { id: "malteada", name: "Malteada", price: 50 },
] as const

export type Ticket = {
  folio: string
  time: string
  channel: Channel
  payment: "Efectivo" | "Terminal propia" | "DiDi Food"
  total: number
  summary: string
  queued?: boolean
}

export const TICKETS_TODAY: Ticket[] = [
  {
    folio: "A-042",
    time: "21:14",
    channel: "mostrador",
    payment: "Efectivo",
    total: 85,
    summary: "Sencilla · Queso, Papas a la francesa",
  },
  {
    folio: "A-041",
    time: "20:58",
    channel: "didi",
    payment: "DiDi Food",
    total: 155,
    summary: "Coreana · Combinada, Papas preparadas, Refresco",
  },
  {
    folio: "A-040",
    time: "20:41",
    channel: "mostrador",
    payment: "Terminal propia",
    total: 70,
    summary: "Flamin' Hot · Salchicha, Refresco",
  },
  {
    folio: "A-039",
    time: "20:22",
    channel: "mostrador",
    payment: "Efectivo",
    total: 120,
    summary: "2× Sencilla · Combinada, Malteada",
  },
  {
    folio: "A-038",
    time: "19:55",
    channel: "mostrador",
    payment: "Efectivo",
    total: 45,
    summary: "Papas a la francesa",
  },
]

export const QUEUED_TICKETS: Ticket[] = [
  {
    folio: "A-045",
    time: "21:48",
    channel: "mostrador",
    payment: "Efectivo",
    total: 85,
    summary: "Sencilla · Queso, Papas a la francesa",
    queued: true,
  },
  {
    folio: "A-044",
    time: "21:36",
    channel: "mostrador",
    payment: "Terminal propia",
    total: 110,
    summary: "Coreana · Queso, Refresco, Soda italiana",
    queued: true,
  },
  {
    folio: "A-043",
    time: "21:29",
    channel: "didi",
    payment: "DiDi Food",
    total: 60,
    summary: "Papas preparadas",
    queued: true,
  },
]

export const CART_ITEMS = [
  {
    id: "1",
    name: "Banderilla",
    variant: "Sencilla · Queso",
    unit: 40,
    qty: 1,
  },
  {
    id: "2",
    name: "Papas a la francesa",
    variant: null as string | null,
    unit: 45,
    qty: 1,
  },
]

export const CART_TOTAL = 85

export const TODAY_ONLINE = {
  sales: 2480,
  orders: 18,
  average: 137.78,
}

export const TODAY_OFFLINE = {
  sales: 2735,
  orders: 21,
  average: 130.24,
}

export const WEEK = {
  label: "Semana del 16 al 22 de noviembre",
  ventas: 8750,
  gastos: 2720,
  coveredSales: 6300,
  coveragePct: 72,
  variantsWithoutCost: 8,
  costoEstimado: 2520,
  margenEstimado: 3780,
  flujo: 6030,
  pedidos: 68,
  ticketPromedio: 128.68,
  insumosPorConsumir: 1640,
  deltas: {
    ventas: 14,
    gastos: -5,
    costoEstimado: 3,
    margenEstimado: 9,
    flujo: 18,
    pedidos: 8,
    ticketPromedio: 5,
  },
  days: [
    { key: "16", label: "Lun 16", ventas: 1400, gastos: 620 },
    { key: "17", label: "Mar 17", ventas: 1500, gastos: 0 },
    { key: "18", label: "Mié 18", ventas: 1570, gastos: 890 },
    { key: "19", label: "Jue 19", ventas: 1800, gastos: 0 },
    { key: "20", label: "Vie 20", ventas: 2480, gastos: 1210 },
    { key: "21", label: "Sáb 21", ventas: 0, gastos: 0, future: true },
    { key: "22", label: "Dom 22", ventas: 0, gastos: 0, future: true },
  ],
  channels: [
    { id: "mostrador", label: "Mostrador", amount: 6650, pct: 76 },
    { id: "didi", label: "DiDi Food", amount: 2100, pct: 24 },
  ],
  payments: [
    { id: "cash", label: "Efectivo", amount: 4820, pct: 55.1 },
    { id: "terminal", label: "Terminal propia", amount: 1830, pct: 20.9 },
    { id: "didi", label: "DiDi Food", amount: 2100, pct: 24 },
  ],
  topProducts: [
    { name: "Papas preparadas", qty: 16, amount: 960 },
    { name: "Banderilla · Flamin' Hot · Combinada", qty: 14, amount: 588 },
    { name: "Refresco", qty: 19, amount: 570 },
    { name: "Banderilla · Sencilla · Salchicha", qty: 22, amount: 550 },
    { name: "Banderilla · Coreana · Queso", qty: 9, amount: 495 },
  ],
  expenses: [
    { label: "Insumos", amount: 1820 },
    { label: "Empaques y desechables", amount: 480 },
    { label: "Gas y servicios", amount: 420 },
    { label: "Otros", amount: 0 },
  ],
}

export const OWNER_NAME = "… Ejemplo"
export const OWNER_EMAIL = "correo@ejemplo.com"
export const BUSINESS_NAME = "Reina de Espadas"
export const TAGLINE = "Sabor digno de la realeza"
export const DEVICE_LABEL = "Dispositivo A · Mostrador"
