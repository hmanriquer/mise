> **BLOQUEADO 2026-11-20 por Hamed. Esta carpeta es la fuente de verdad (SoT).**

# Mise · mocks v1 (2026-11-20)

Carpeta: `/workspace/mocks/mise/`.  
App de trabajo (shadcn real, no HTML suelto): `/workspace/mise-mock-app/`.  
Light mode. PC 1366×768 y tablet Android 1280×800. Copy en es-MX.

## Decisiones de Hamed 2026-11-20

- **Después de entrar se llega a Inicio `/`**, con el resumen del día y el botón Nueva venta. El spec decía `/vender`.
- **La ruta de login es `/login`**, no `/entrar`. El título y los botones siguen diciendo «Entrar» / «Entrar con passkey». El spec §1.4 usa `/entrar`; Hamed eligió `/login`.
- **En Vender, al elegir DiDi Food aparece un aviso** de que los precios son de ejemplo hasta que se confirme la lista en Catálogo. No se pone una insignia en cada precio.
- **Se deja el borde de input del preset**, aunque el contraste sea 1.26:1 (hace falta 3:1 para UI). Aceptado por Hamed el 2026-11-20. No se tocó el token.
- **Passkey es la entrada principal**; correo y contraseña son el fallback «Usar contraseña».
- **El cobro de DiDi Food es un registro manual**, porque no hay conexión con la API de DiDi. Lo pidió Hamed el 2026-11-20: método fijo DiDi Food, sin efectivo ni cambio, aviso de registro manual, folio DiDi opcional, y el botón «Registrar venta DiDi e imprimir».

## Cómo se obtuvieron los tokens

No se reconstruyó el preset a mano.

1. `npx shadcn@latest preset decode b6Cf5S2iOm --json` devolvió: style `maia`, base Mauve, tema pink, `iconLibrary: hugeicons`, `font: inter`, `fontHeading: manrope`, `radius: default`, `chartColor: rose`. URL: https://ui.shadcn.com/create?preset=b6Cf5S2iOm
2. Se inicializó la app con  
   `npx shadcn@latest init --name mise-mock-app --preset b6Cf5S2iOm --template vite --base base --no-monorepo`  
   en `/workspace/mise-mock-app`.
3. Los tokens quedaron en `src/index.css` tal cual los escribió el CLI, sin editarlos:
   - `--primary: oklch(0.525 0.223 3.958)`
   - `--radius: 0.625rem`
   - Inter Variable (cuerpo) y Manrope Variable (títulos, `font-heading`)
   - primitivas `@base-ui/react`, iconos Hugeicons

Los componentes se agregaron con `npx shadcn@latest add`. Las pantallas solo componen esos componentes; no hay primitivas propias.

**Nada se aproximó en color, radio, tipografía ni iconos.** La única excepción de comportamiento es el caparazón de tablet: a 1280 px el `Sidebar` de shadcn seguiría en modo escritorio (el corte es 768 px), así que las capturas de tablet fuerzan el sheet con `?shell=tablet` / `data-shell="tablet"`.

## Pantallas

| Archivo | Qué muestra |
| --- | --- |
| `shots/login-pc.png`, `login-tablet.png` | `/login` — passkey primero (toma principal) |
| `shots/login-password-pc.png`, `login-password-tablet.png` | `/login?password=1` — fallback de correo y contraseña |
| `shots/inicio-pc.png`, `inicio-tablet.png` | `/` — hoy de un vistazo y Nueva venta |
| `shots/inicio-offline-pc.png`, `inicio-offline-tablet.png` | `/` en sin conexión, con 3 ventas en cola |
| `shots/tablero-pc.png`, `tablero-tablet.png` | `/tablero` — Semana del 16 al 22 de noviembre |
| `shots/vender-pc.png`, `vender-tablet.png` | `/vender?picker=1` — selector de sabor × relleno abierto (dialog en PC, drawer en tablet) |
| `shots/vender-grid-pc.png`, `vender-grid-tablet.png` | `/vender` — catálogo en la pestaña Todas, carrito visible, canal Mostrador |
| `shots/vender-didi-pc.png`, `vender-didi-tablet.png` | `/vender?didi=1` — canal DiDi Food, aviso de precios de ejemplo y la misma parrilla |
| `shots/cobro-pc.png`, `cobro-tablet.png` | `/vender?cobro=1` — cobro de Mostrador: $85, recibido $100, cambio $15 |
| `shots/cobro-didi-pc.png`, `cobro-didi-tablet.png` | `/vender?didi=1&cobro=1` — registro manual de un pedido DiDi |

`OVERVIEW.png` junta las 20 tomas.

## Movidas de diseño

### Entrar (`/login`)
La acción principal es **Entrar con passkey**, botón grande con `FingerPrintIcon` y la pista «Usa tu huella o el PIN de este dispositivo». **Usar contraseña** es un botón `link` que revela el formulario de correo y contraseña. En el fallback, Entrar es el único botón sólido y «Entrar con passkey» vuelve al inicio. Sigue siendo un solo dueño, sin registro. El nombre del dueño en el resto de la app es «… Ejemplo»; el correo del mock es `correo@ejemplo.com`.

### Inicio (`/`)
Saludo, un solo CTA sólido «Nueva venta», KPIs de hoy (ventas, pedidos, ticket promedio), últimos folios (A-042…), estado de sync e impresora, y atajos a Tablero y Gastos. Después de entrar, esta es la pantalla de llegada. En sin conexión el chip dice «Sin conexión · 3 ventas en cola», aparece un `alert`, los folios A-043 a A-045 llevan insignia «En cola» y los totales de hoy incluyen esas ventas locales. La impresora sigue «lista».

### Tablero
Periodo Semana (Día / Mes están a la vista, no hay tomas extra). KPIs: Ventas, Gastos, Costo estimado, Margen estimado, Flujo, Pedidos, Ticket promedio, cada uno con el cambio vs la semana anterior. El `alert` dice «Margen estimado sobre el 72% de las ventas con costo registrado» y aclara que el margen usa $6,300.00 de $8,750.00, con 8 productos sin costo. La gráfica es ventas vs gastos por día (sábado y domingo aún vacíos: hoy es viernes 20 de noviembre de 2026). «Cómo se vendió» junta canal y método de pago. En 768 px de alto, productos más vendidos e insumos quedan debajo del pliegue; en tablet 800 px se alcanza a ver el arranque de esas tablas. Los números son de ejemplo, plausibles para un puesto chico.

### Vender
Interruptor Mostrador / DiDi Food. Pestañas Todas / Banderillas / Papas / Bebidas. La pestaña Todas muestra la parrilla completa (banderilla, dos papas y seis bebidas) para que el catálogo se lea bien; la banderilla sigue siendo un solo producto «Desde $15.00». El sabor × relleno se elige en dialog (PC) o drawer (tablet); en esa toma, Coreana está seleccionado y cada relleno muestra su precio (30 / 37 / 40 / 47 / 55). El carrito trae Sencilla · Queso $40 y Papas a la francesa $45 (total $85).

Con DiDi Food aparece un `alert`: «Los precios de DiDi Food son de ejemplo hasta que confirmes la lista en Catálogo. Por ahora se muestran los mismos que en Mostrador.» El carrito pasa a decir «DiDi Food» y el CTA cambia a «Registrar $85.00».

### Cobro
En Mostrador, dialog con Efectivo (activo) y Terminal propia, recibido $100.00, cambio $15.00, nombre del cliente y nota para cocina opcionales, y «Cobrar e imprimir».

En DiDi Food no hay efectivo ni cambio. El método queda fijo en DiDi Food. Un `alert` a lo ancho dice «Registro manual» y «Sin conexión con DiDi Food. Captura el pedido aquí para tu control; DiDi no se actualiza.» Hay un campo opcional «Folio DiDi». El texto aclara que solo se imprime el ticket de cocina. El CTA es «Registrar venta DiDi e imprimir».

## Contraste

39 de 40 pares pasan AA (texto 4.5:1, UI 3:1). El único fallo es el borde de los inputs del preset: `--border` / `--input` `oklch(0.922 0.005 325.62)` queda en **1.26:1** sobre blanco (hace falta 3:1). Hamed aceptó dejar el token del preset el 2026-11-20.

El magenta primario con el texto `primary-foreground` sí pasa (5.41:1). El muted del preset también (5.10:1 sobre blanco; 4.88:1 sobre el fondo del sidebar).

## Otras decisiones de estas mocks

- La toma `vender-pc` deja el selector de variantes abierto, para ver el sabor × relleno. El catálogo sin overlay está en `vender-grid-*`.
- Cobro es un dialog sobre `/vender`, no una ruta nueva.
- Solo light. El preset trae `.dark` gratis, pero no se sumaron pantallas oscuras a la revisión.
- Tablet usa el `Sheet` del sidebar, no una barra persistente.
- Un solo botón sólido magenta por vista.
- Metas táctiles de 44 px (`min-h-11`) en CTA, chips de canal, steppers y tiles.
- `/entrar` sigue resolviendo a la pantalla de login en la app de trabajo, por si alguien la escribe, pero las tomas y los enlaces usan `/login`.

## Desviaciones respecto al SPEC.md

- El spec describe Better Auth con correo y contraseña como método de entrada. El mock pone passkey al frente, con contraseña como plan B.
- Se agrega la ruta Inicio `/`. El spec dice que el destino tras el login es `/vender`; Hamed eligió Inicio.
- La ruta de login en el spec es `/entrar`; Hamed eligió `/login`.
- Pedidos, Gastos, Catálogo y Ajustes aparecen en la navegación, pero no se mockearon (fuera de las 5 pantallas pedidas).
- El cobro de DiDi queda como registro manual, sin integración con la API, como pidió Hamed. El spec ya decía que DiDi Food es el único método de ese canal y que el folio de DiDi es opcional.

## Cómo regenerar las tomas

Con Vite de `/workspace/mise-mock-app` en `:5173`:

```bash
python3 /workspace/mocks/mise/capture.py
python3 /workspace/mocks/mise/contrast.py
python3 /workspace/mocks/mise/make_overviews.py
```
