export const SERVICE_WORKER_URL = "/sw.js"

// The message Workbox's generated service worker listens for to activate a waiting worker.
export const SKIP_WAITING_MESSAGE = { type: "SKIP_WAITING" } as const
