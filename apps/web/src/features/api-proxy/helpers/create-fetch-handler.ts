import { isApiPath } from "@workspace/contracts"
import type { FetchHandlerDependencies } from "../types/fetch-target"

export function createFetchHandler(dependencies: FetchHandlerDependencies) {
  return async (request: Request): Promise<Response> => {
    const { pathname } = new URL(request.url)
    const target = isApiPath(pathname) ? dependencies.api : dependencies.app
    return target.fetch(request)
  }
}
