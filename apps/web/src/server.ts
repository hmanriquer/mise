import handler from "@tanstack/react-start/server-entry"
import { createFetchHandler } from "@/features/api-proxy"

interface MiseWebEnv {
  API: Fetcher
}

export default {
  fetch(request: Request, env: MiseWebEnv) {
    return createFetchHandler({ api: env.API, app: handler })(request)
  },
}
