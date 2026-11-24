export interface FetchTarget {
  fetch(request: Request): Response | Promise<Response>
}

export interface FetchHandlerDependencies {
  api: FetchTarget
  app: FetchTarget
}
