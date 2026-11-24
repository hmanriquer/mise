// The SPA shell only server-renders the root. Leaf routes must stay client-only so the shell
// hydrates without a mismatch; every route spreads this so none can forget it.
export const CLIENT_ONLY_ROUTE = { ssr: false } as const
