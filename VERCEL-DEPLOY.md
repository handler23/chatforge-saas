# Vercel deploy — ha piros Error

## 1. Build cache kikapcsolása (kötelező egyszer)

Vercel → **Settings → Environment Variables** → Add:

| Key | Value |
|-----|--------|
| `VERCEL_FORCE_NO_BUILD_CACHE` | `1` |

Production + Preview → **Save**

## 2. Redeploy cache nélkül

**Deployments** → legújabb sor → **⋯** → **Redeploy**

- **NE** pipáld: "Use existing Build Cache"

## 3. Framework

**Settings → Build and Deployment**

- Framework: **Next.js**
- Node.js: **20.x**

## 4. Env változók (6 db)

- `NEXT_PUBLIC_APP_URL` = https://project-86qko.vercel.app
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPER_ADMIN_EMAILS`
- `OPENAI_API_KEY`
