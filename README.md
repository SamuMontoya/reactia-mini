# Reactia Mini: Escáner de Crecimiento

Reactia Mini ofrece un diagnóstico gratuito de 12 preguntas para que un dueño
de negocio identifique su cuello de botella de crecimiento y un siguiente paso
concreto. El resultado se muestra en un dashboard web con scoring por IA.

**Estado: en producción.** Desplegado en Vercel bajo [kreanding.com](https://kreanding.com),
con deploy automático en cada push a `main`.

## Flujo

Landing (con historial de diagnósticos previos del dispositivo) → gatekeeping
→ 12 preguntas (con autosave, retomar borrador y dictado por voz) → resumen
editable → generación → dashboard de resultado.

El gatekeeping pide rango de facturación, años de operación, rol, nombre,
empresa y WhatsApp. No bloquea a quien no califica: registra `califica` para
segmentación y permite continuar. El resultado no tiene tabs, expira a los 7
días, y su CTA único abre una conversación de WhatsApp con el contexto del
diagnóstico.

Cada dispositivo tiene un límite de 3 diagnósticos gratuitos, enforced tanto
en el cliente (popup) como en el servidor (no se puede saltar navegando
directo a `/gatekeeping`).

## Stack

- Next.js 16 (App Router), React 19 y Tailwind CSS v4
- Supabase para `leads`, `diagnosticos`, `resultados` y `device_diagnostics`,
  con Row Level Security activo (ver [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md))
- Groq para scoring estructurado
- React Hook Form + Zod para los formularios
- Web Speech API para el dictado por voz (sin costo, nativo del navegador)
- Vercel para hosting y deploys

## Configuración

Consulta [docs/SETUP.md](docs/SETUP.md),
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) y
[docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md).

## Comandos

```bash
npm run dev
npx tsc --noEmit
npm run lint
npm test
npm run build
```

## Deploy

El repo está conectado a Vercel (`SamuMontoya/reactia-mini` → proyecto
`reactia-mini`); cada push a `main` dispara un deploy de producción
automático. Para desplegar manualmente desde el CLI:

```bash
vercel --prod
```

Las migraciones de Supabase se aplican con el CLI, ya vinculado a este
proyecto:

```bash
supabase db push
```
