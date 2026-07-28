# Arquitectura

## Flujo del funnel

```
/reactia-mini → /reactia-mini/gatekeeping → /reactia-mini/diagnostico
                                             (11 preguntas + resumen editable)
    → /reactia-mini/generando → /reactia-mini/resultado
```

El gatekeeping recoge nombre, empresa, WhatsApp, rango de facturación, años y
rol. Todos continúan al diagnóstico; `califica` solo segmenta el lead. La
identidad mínima se conserva en `localStorage` y el wizard guarda un borrador
por lead. Antes de enviar, la persona ve un resumen y puede editar cualquier
respuesta sin perder las demás.

El resultado es un dashboard de una página sin tabs: score total, radar SVG,
barras por área, cuello de botella, próximo paso, benchmark, KPIs y CTA de
WhatsApp.

## Datos

`leads` contiene `nombre`, `empresa`, `whatsapp`, `facturacion_rango`,
`facturacion_mensual_cop` (el piso COP del rango), `anios_operacion`, `rol`,
`califica` y estado. `diagnosticos` enlaza un lead y guarda las 11 respuestas
en JSONB. `resultados` enlaza un diagnóstico con seis scores, cuello de
botella, próximo paso, benchmark y cuatro KPIs.

La migración [0005_add_empresa_and_facturacion_rango.sql](../supabase/migrations/0005_add_empresa_and_facturacion_rango.sql)
es aditiva y debe ejecutarse manualmente en el SQL Editor de Supabase antes de
producción.

## APIs

| Endpoint | Método | Función |
| --- | --- | --- |
| `/api/mini/gatekeeping` | POST | Valida, deriva COP desde el rango e inserta el lead. |
| `/api/mini/diagnostico/save` | POST | Valida las 11 respuestas y persiste el diagnóstico. |
| `/api/mini/resultado/save` | POST | Ejecuta scoring Groq y persiste el resultado. |
| `/api/mini/leads/[leadId]/email` | PATCH | Actualiza el correo de un lead. |

El prompt de scoring está en `lib/scoring/buildPrompt.ts`; el resultado se
valida con Zod antes de guardarse. Las rutas usan Route Handlers del App Router.
