# Reactia Mini: Escáner de Crecimiento

Reactia Mini ofrece un diagnóstico gratuito de 11 preguntas para que un dueño
de negocio identifique su cuello de botella de crecimiento y un siguiente paso
concreto. El resultado se muestra en un dashboard web con scoring por IA.

## Flujo

Landing → gatekeeping → 11 preguntas → resumen editable → generación →
dashboard de resultado.

El gatekeeping pide rango de facturación, años de operación, rol, nombre,
empresa y WhatsApp. No bloquea a quien no califica: registra `califica` para
segmentación y permite continuar. El resultado no tiene tabs y su CTA único
abre una conversación de WhatsApp con el contexto del diagnóstico.

## Stack

- Next.js 16 (App Router), React 19 y Tailwind CSS v4
- Supabase para `leads`, `diagnosticos` y `resultados`
- Groq para scoring estructurado
- React Hook Form + Zod para los formularios

## Configuración

Consulta [docs/SETUP.md](docs/SETUP.md),
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) y
[docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md).

Antes de producción ejecuta manualmente la migración
[`0005_add_empresa_and_facturacion_rango.sql`](supabase/migrations/0005_add_empresa_and_facturacion_rango.sql)
en el SQL Editor de Supabase. También configura
`NEXT_PUBLIC_WHATSAPP_NUMBER` con un número real: sin él, el CTA de WhatsApp
permanece deshabilitado deliberadamente.

## Comandos

```bash
npm run dev
npx tsc --noEmit
npm run lint
npm test
npm run build
```
# reactia-mini
