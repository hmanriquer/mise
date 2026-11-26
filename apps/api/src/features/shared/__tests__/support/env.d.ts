declare namespace Cloudflare {
  interface Env {
    DB: D1Database
    TEST_MIGRATIONS: import("cloudflare:test").D1Migration[]
    AUTH_ORIGIN: string
    AUTH_RP_ID: string
    BETTER_AUTH_SECRET: string
    OWNER_BOOTSTRAP_TOKEN: string
  }
}
