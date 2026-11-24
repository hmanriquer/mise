import { createRootRoute, HeadContent, Link, Scripts } from "@tanstack/react-router"
import { buttonVariants } from "@workspace/ui/components/button"
import appCss from "@workspace/ui/globals.css?url"
import { ROUTES, SHARED_COPY } from "@/features/shared"

const HTML_LANGUAGE = "es-MX"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: SHARED_COPY.appName,
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
})

function NotFound() {
  return (
    <main className="flex flex-col items-start gap-4 p-4">
      <h1 className="font-heading text-2xl font-semibold">{SHARED_COPY.notFound.title}</h1>
      <Link to={ROUTES.home} className={buttonVariants({ className: "min-h-11" })}>
        {SHARED_COPY.notFound.action}
      </Link>
    </main>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang={HTML_LANGUAGE}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
