# Setup

## Requisitos

- Node.js 20+
- Un proyecto de Supabase ya creado
- Una API key de Groq
- [Supabase CLI](https://supabase.com/docs/guides/cli) instalado y logueado
  (`supabase login`), para aplicar migraciones
- [Vercel CLI](https://vercel.com/docs/cli) instalado y logueado (`vercel login`),
  para deploys manuales

## 1. Clonar e instalar

```bash
git clone https://github.com/SamuMontoya/reactia-mini.git
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
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API (clave pública/anon — respeta RLS) |
| `NEXT_SUPABASE_SECRET_KEY` | Supabase → Project Settings → API (clave secreta/service role — bypassa RLS, **nunca** con prefijo `NEXT_PUBLIC_`) |
| `GROQ_API_KEY` | console.groq.com → API Keys |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | Dashboard de Umami → tu website |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número real de WhatsApp, con código de país y solo dígitos |

Este mismo archivo `.env.local` es la fuente para las variables de entorno en
Vercel (ver sección 6).

## 3. Base de datos: vincular y migrar

```bash
supabase link --project-ref <tu-project-ref>
supabase db push
```

Esto aplica en orden todas las migraciones de `supabase/migrations/`,
incluyendo la creación de `leads`/`diagnosticos`/`resultados`/`device_diagnostics`
y la reactivación de Row Level Security (`0007_enable_rls.sql`) — ver
[docs/ARCHITECTURE.md](ARCHITECTURE.md) para el detalle de qué políticas
quedan activas y por qué.

## 4. Levantar en desarrollo

```bash
npm run dev
```

Abre http://localhost:3000/reactia-mini.

## 5. Build de producción

```bash
npm run build
```

## 6. Tests

```bash
npm test
npx tsc --noEmit
```

## 7. Deploy a Vercel

Primera vez:

```bash
vercel link
vercel git connect
```

`vercel git connect` conecta el repo de GitHub al proyecto de Vercel para que
cada push a `main` dispare un deploy automático — requiere haber instalado la
GitHub App de Vercel en la cuenta/repo primero
(https://github.com/apps/vercel/installations/new).

Sincroniza las variables de entorno de `.env.local` (una vez, y de nuevo cada
vez que cambie alguna):

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_URL development
# repetir por cada variable de .env.local
```

Deploy manual (normalmente innecesario, el push a `main` ya lo dispara):

```bash
vercel --prod
```

Si el proyecto es nuevo, revisa **Project Settings → Deployment Protection**
en el dashboard de Vercel — por defecto exige login de Vercel para ver
cualquier deploy, incluyendo producción; desactívalo para que el sitio sea
público.

### Dominio propio

Para apuntar un dominio ya comprado (ej. en Hostinger):

```bash
vercel domains add tu-dominio.com
```

Esto imprime el registro DNS exacto a crear (normalmente un `A` en `@` hacia
la IP de Vercel). Agrégalo en tu proveedor de DNS sin tocar los registros de
correo (MX, DKIM, SPF, DMARC) — si `www` ya apunta al dominio raíz por CNAME,
queda resuelto automáticamente en el mismo cambio.
