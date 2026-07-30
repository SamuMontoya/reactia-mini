# Arquitectura

## Flujo del funnel

```
/reactia-mini → /reactia-mini/gatekeeping → /reactia-mini/diagnostico
  (historial de diagnósticos          (12 preguntas + resumen editable,
   previos del dispositivo,            autosave por lead, dictado por voz,
   límite de 3 gratuitos)               retomar borrador)
    → /reactia-mini/generando → /reactia-mini/resultado
                                  (expira a los 7 días)
```

El gatekeeping recoge nombre, empresa, WhatsApp, rango de facturación, años y
rol. Todos continúan al diagnóstico; `califica` solo segmenta el lead. La
identidad mínima (`leadId`, `deviceId`) se conserva en `localStorage`, y el
wizard guarda un borrador por lead — si hay uno con respuestas al volver a
`/diagnostico`, un modal ofrece continuarlo o empezar de nuevo. Antes de
enviar, la persona ve un resumen y puede editar cualquier respuesta sin
perder las demás; si la validación falla ahí (ej. un borrador viejo con un
campo "otro" sin completar), la pantalla salta automáticamente a la primera
pregunta con error en vez de fallar en silencio.

El dictado por voz (`components/ui/DictateButton.tsx`) usa la Web Speech API
nativa del navegador — una frase por toque, sin reinicio automático (roto en
iOS), con el texto interino fundido directamente dentro del campo de texto en
vez de una vista previa flotante.

El resultado es un dashboard de una página sin tabs: score total, radar SVG,
barras por área, cuello de botella, próximo paso, benchmark, KPIs y CTA de
WhatsApp. Expira a los 7 días desde `created_at` (calculado en el cliente); un
modal no descartable reemplaza el contenido una vez expirado, y el popup de
"¿necesitas ayuda?" se suprime en ese caso para no competir con él.

## Límite de diagnósticos gratuitos

Cada `device_id` (UUID en `localStorage`, con fallback si `crypto.randomUUID`
no está disponible) tiene un máximo de 3 diagnósticos gratis
(`lib/constants/limits.ts`). Se enforce en dos capas:

- **Cliente** (`app/reactia-mini/page.tsx`): el botón principal muestra un
  popup en vez de navegar, una vez alcanzado el límite — solo UX, no es el
  gate real.
- **Servidor** (`asegurarLimiteDiagnosticosNoAlcanzado`, `lib/api/device.ts`):
  corre en `submitGatekeeping` (bloquea la creación de un lead nuevo tan
  pronto como sea posible) y de nuevo en `saveDiagnostico` (defensa adicional
  contra carreras, ej. dos pestañas abiertas a la vez). Esto es lo que en
  realidad impide saltarse el límite navegando directo a `/gatekeeping`.

## Datos

`leads` contiene `nombre`, `empresa`, `whatsapp`, `facturacion_rango`,
`facturacion_mensual_cop` (el piso COP del rango), `anios_operacion`, `rol`,
`califica`, `estado` y `device_id`. `diagnosticos` enlaza un lead y guarda las
12 respuestas en JSONB. `resultados` enlaza un diagnóstico con seis scores,
cuello de botella, próximo paso, benchmark y cuatro KPIs. `device_diagnostics`
enlaza cada diagnóstico con su dispositivo de origen — es la tabla detrás del
historial en la landing y del conteo del límite de 3 gratuitos.

### Row Level Security

Las cuatro tablas tienen RLS activo (migración
[`0007_enable_rls.sql`](../supabase/migrations/0007_enable_rls.sql)). Hay dos
clientes de Supabase:

- `lib/supabase.ts` — clave pública/anon (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`),
  usada solo desde el navegador en `generando/page.tsx` y `resultado/page.tsx`
  para leer directamente. Solo tiene políticas de **SELECT** sobre `leads`,
  `diagnosticos` y `resultados` — no puede insertar, actualizar ni borrar
  nada, y no tiene ninguna política sobre `device_diagnostics`.
- `lib/supabaseAdmin.ts` — clave secreta (`NEXT_SUPABASE_SECRET_KEY`),
  server-only, usada por todo `lib/api/*.ts` (llamado únicamente desde Route
  Handlers). Bypassa RLS por completo. Este archivo lanza un error
  inmediato si alguna vez se importa desde un componente `'use client'`.

## APIs

| Endpoint | Método | Función |
| --- | --- | --- |
| `/api/mini/gatekeeping` | POST | Valida, deriva COP desde el rango, chequea el límite de diagnósticos e inserta el lead. |
| `/api/mini/diagnostico/save` | POST | Valida las 12 respuestas, chequea el límite de nuevo y persiste el diagnóstico. |
| `/api/mini/resultado/save` | POST | Ejecuta scoring Groq y persiste el resultado. |
| `/api/mini/leads/[leadId]/email` | PATCH | Actualiza el correo de un lead. |
| `/api/mini/device/[deviceId]/diagnosticos` | GET | Historial de diagnósticos de un dispositivo (para la landing). |

El prompt de scoring está en `lib/scoring/buildPrompt.ts`; el resultado se
valida con Zod antes de guardarse. Las rutas usan Route Handlers del App
Router.

## Deploy

Vercel, conectado al repo de GitHub (`SamuMontoya/reactia-mini`) — cada push
a `main` dispara un deploy de producción. Dominio propio `kreanding.com`
apuntado por un registro `A` en Hostinger (`@` → la IP de Vercel), dejando el
resto de la zona DNS (correo, DKIM, SPF, DMARC) intacta.
