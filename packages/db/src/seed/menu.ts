import type { MenuSeed, OptionGroupSeed } from "./types"

// The Reina de Espadas menu. Counter prices in pesos; DiDi Food prices are seeded as
// placeholders equal to these until the client sends the real DiDi list.

const SABOR = {
  id: "banderilla-sabor",
  name: "Sabor",
  values: [
    { id: "sencilla", name: "Sencilla" },
    { id: "flamin-hot", name: "Flamin' Hot" },
    { id: "flamin-blue", name: "Flamin' Blue" },
    { id: "coreana", name: "Coreana" },
  ],
} as const satisfies OptionGroupSeed

const RELLENO = {
  id: "banderilla-relleno",
  name: "Relleno",
  values: [
    { id: "mini-salchicha", name: "Mini Salchicha" },
    { id: "mini-queso", name: "Mini Queso" },
    { id: "salchicha", name: "Salchicha" },
    { id: "combinada", name: "Combinada" },
    { id: "queso", name: "Queso" },
  ],
} as const satisfies OptionGroupSeed

type SaborId = (typeof SABOR.values)[number]["id"]
type RellenoId = (typeof RELLENO.values)[number]["id"]
type PricesByRelleno = Record<RellenoId, number>

// Flamin' Hot and Flamin' Blue share the Flamin price (tracker #22, decisions).
const FLAMIN_PRICES: PricesByRelleno = {
  "mini-salchicha": 25,
  "mini-queso": 32,
  salchicha: 35,
  combinada: 42,
  queso: 50,
}

const BANDERILLA_PRICES: Record<SaborId, PricesByRelleno> = {
  sencilla: { "mini-salchicha": 15, "mini-queso": 22, salchicha: 25, combinada: 32, queso: 40 },
  "flamin-hot": FLAMIN_PRICES,
  "flamin-blue": FLAMIN_PRICES,
  coreana: { "mini-salchicha": 30, "mini-queso": 37, salchicha: 40, combinada: 47, queso: 55 },
}

export const MENU_SEED: MenuSeed = {
  profile: { name: "Reina de Espadas", tagline: "Sabor digno de la realeza" },
  categories: [
    {
      id: "banderillas",
      name: "Banderillas",
      products: [
        {
          kind: "matrix",
          id: "banderilla",
          name: "Banderilla",
          rowGroup: SABOR,
          columnGroup: RELLENO,
          pricesPesos: BANDERILLA_PRICES,
        },
      ],
    },
    {
      id: "papas",
      name: "Papas",
      products: [
        { kind: "single", id: "papas-a-la-francesa", name: "Papas a la francesa", pricePesos: 45 },
        { kind: "single", id: "papas-preparadas", name: "Papas preparadas", pricePesos: 60 },
      ],
    },
    {
      id: "bebidas",
      name: "Bebidas",
      products: [
        { kind: "single", id: "refresco", name: "Refresco", pricePesos: 30 },
        { kind: "single", id: "soda-italiana", name: "Soda italiana", pricePesos: 40 },
        { kind: "single", id: "mojito-virgen", name: "Mojito virgen", pricePesos: 40 },
        { kind: "single", id: "sunset", name: "Sunset", pricePesos: 45 },
        { kind: "single", id: "cafe-ole", name: "Café Olé", pricePesos: 38 },
        { kind: "single", id: "malteada", name: "Malteada", pricePesos: 50 },
      ],
    },
  ],
}
