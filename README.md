# Multi-Tenant AI Chatbot SaaS

## Lépés 2 — Supabase beállítás

### 1. Project URL beírása

Nyisd meg `.env.local` és cseréld:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
```

a valódi URL-re (Supabase Dashboard → **Project Settings** → **API** → **Project URL**).

### 2. SQL futtatása

1. [Supabase Dashboard](https://supabase.com/dashboard) → projekted → **SQL Editor**
2. Nyisd meg: `supabase/migrations/001_initial_schema.sql`
3. Másold be az egész tartalmat → **Run**

### 3. Super admin (regisztráció után)

```sql
update public.profiles
set role = 'super_admin'
where email = 'te@email.cim.hu';
```

## Helyi futtatás (Lépés 3)

```powershell
cd "D:\IT programok\Multi-Tenant SaaS"
npm run dev
```

Böngésző: http://localhost:3000

## Lépés 4 — Auth beállítás Supabase-ben

1. **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`
2. **Authentication → Providers → Email** — dev-hez kapcsold ki: **Confirm email**
3. Futtasd az SQL-t: `supabase/migrations/002_workspace_member_bootstrap.sql` (SQL Editor → Run)
4. **Redirect URLs** (Authentication → URL Configuration):
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/reset-password`

### Bejelentkezés nem megy?

1. **Supabase → Users** → töröld a teszt usert → regisztrálj újra **ismert jelszóval**
2. Vagy: `/forgot-password` → email → link → új jelszó
3. Ha továbbra is hiba: `.env.local`-ban cseréld a kulcsokat **legacy** `anon` + `service_role` JWT-re (API → Legacy keys)

## Teszt

1. `npm run dev`
2. http://localhost:3000/register — új fiók
3. Átirányítás → `/dashboard`

## Következő lépés

## Lépés 6 — Élő AI chat

1. **OpenAI:** https://platform.openai.com/api-keys → új kulcs
2. **Vercel env:** `OPENAI_API_KEY=sk-...` → Redeploy
3. **Lokálisan:** `.env.local` → `OPENAI_API_KEY=sk-...`
4. Teszt: embed vagy `http://localhost:3000/embed-test.html` → írj az ügyfélnek
5. **Dashboard → Conversations** — látod a beszélgetéseket

Lépés 9 — Stripe: **„mehet a 9”**
