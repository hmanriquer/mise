import { HugeiconsIcon } from "@hugeicons/react"
import { FingerPrintIcon, SpadesIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { BUSINESS_NAME, OWNER_EMAIL, TAGLINE } from "@/lib/data"
import { navigate } from "@/lib/nav"

export function LoginScreen({ password = false }: { password?: boolean }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-6 py-10">
      <main className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <HugeiconsIcon icon={SpadesIcon} strokeWidth={2} />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-2xl font-semibold" data-contrast="login-title">
              {BUSINESS_NAME}
            </h1>
            <p className="text-muted-foreground text-sm" data-contrast="login-tagline">
              {TAGLINE}
            </p>
          </div>
        </div>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>{password ? "Entrar con contraseña" : "Entrar"}</CardTitle>
            <CardDescription data-contrast="login-desc">
              Inicia sesión con la cuenta del dueño. No hay registro.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {password ? <PasswordForm /> : <PasskeyForm />}
          </CardContent>
          <CardFooter>
            <p className="text-muted-foreground text-xs" data-contrast="login-foot">
              Mise necesita conexión a internet solo para entrar. Después puedes vender sin red.
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}

function PasskeyForm() {
  return (
    <div className="flex flex-col gap-4">
      <Button
        type="button"
        className="min-h-14 w-full text-base"
        data-contrast="login-cta"
        onClick={() => navigate("/")}
      >
        <HugeiconsIcon icon={FingerPrintIcon} strokeWidth={2} data-icon="inline-start" />
        Entrar con passkey
      </Button>
      <p className="text-muted-foreground text-center text-sm" data-contrast="passkey-hint">
        Usa tu huella o el PIN de este dispositivo
      </p>
      <Button
        type="button"
        variant="link"
        className="min-h-11 w-full"
        data-contrast="login-fallback"
        onClick={() => navigate("/login", { password: "1" })}
      >
        Usar contraseña
      </Button>
    </div>
  )
}

function PasswordForm() {
  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault()
        navigate("/")
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Correo</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            defaultValue={OWNER_EMAIL}
            className="min-h-11"
            data-contrast="input"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            defaultValue="password"
            className="min-h-11"
          />
        </Field>
      </FieldGroup>
      <Button type="submit" className="min-h-11 w-full" data-contrast="login-cta">
        Entrar
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="min-h-11 w-full"
        onClick={() => navigate("/login")}
      >
        <HugeiconsIcon icon={FingerPrintIcon} strokeWidth={2} data-icon="inline-start" />
        Entrar con passkey
      </Button>
    </form>
  )
}
