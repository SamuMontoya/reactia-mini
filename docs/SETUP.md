# Setup

## Requisitos

- Node.js 20+
- Un proyecto de Supabase ya creado
- Una API key de Groq

## 1. Clonar e instalar

```bash
git clone <repo-url> reactia-mini
cd reactia-mini
npm install
```

## 2. Variables de entorno

Crea `.env.local` en la raíz con:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_SUPABASE_SECRET_KEY=sb_secret_...
GROQ_API_KEY=gsk_...
NEXT_PUBLIC_UMAMI_WEBSITE_ID=...
NEXT_PUBLIC_WHATSAPP_NUMBER=573001234567
```

| Variable | Dónde conseguirla |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API (clave pública/anon) |
| `NEXT_SUPABASE_SECRET_KEY` | Supabase → Project Settings → API (clave secreta/service role) |
| `GROQ_API_KEY` | console.groq.com → API Keys |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | Dashboard de Umami → tu website |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número real de WhatsApp, con código de país y solo dígitos |

Las tablas (`leads`, `diagnosticos`, `resultados`) se crean con el SQL en
`supabase/migrations/` — deben correrse manualmente, en orden, en el SQL
Editor del dashboard de Supabase (no hay conexión de CLI automatizada en
este proyecto).

Antes de producción corre también **manualmente**
`supabase/migrations/0005_add_empresa_and_facturacion_rango.sql` en el SQL
Editor. Agrega las columnas `empresa` y `facturacion_rango`; el valor numérico
histórico se mantiene como el piso COP del rango elegido. Configura además
`NEXT_PUBLIC_WHATSAPP_NUMBER` con un número real. Si falta o conserva el
placeholder, el CTA de WhatsApp se deshabilita para evitar un enlace roto.

## 3. Levantar en desarrollo

```bash
npm run dev
```

Abre http://localhost:3000/reactia-mini.

## 4. Build de producción

```bash
npm run build
```

## 5. Tests

```bash
npm test
```
