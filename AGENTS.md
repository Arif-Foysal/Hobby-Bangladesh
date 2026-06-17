# AGENTS.md

## Stack

Next.js 15 (App Router) + Supabase (cookie-based auth via `@supabase/ssr`) + Tailwind CSS + shadcn/ui (new-york style, Radix primitives) + next-themes (dark mode).

## Commands

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run lint      # ESLint (next/core-web-vitals + next/typescript)
```

No test suite configured yet.

## Auth — critical gotchas

**No `middleware.ts`.** Auth protection is in `proxy.ts` (root) which calls `lib/supabase/proxy.ts:updateSession()`. It intercepts all non-static requests and redirects unauthenticated users to `/auth/login` (except `/`, `/auth/*`, `/login`).

**Three Supabase client patterns**, all using `createServerClient` from `@supabase/ssr`:

| File | Where to use | Cookie source |
|------|-------------|---------------|
| `lib/supabase/client.ts` | Client Components (`"use client"`) | Browser (automatic) |
| `lib/supabase/server.ts` | Server Components, Route Handlers | `next/headers` cookies() |
| `lib/supabase/proxy.ts` | Only in `proxy.ts` | `NextRequest.cookies` |

**Never cache Supabase clients** in global variables — the code comments warn about Fluid compute breaking this. Create a fresh client per request/function call.

**Always call `supabase.auth.getClaims()`** after creating the server/proxy client and before doing anything else. Skipping this causes **random user logouts** in SSR. Do not insert code between `createServerClient()` and `getClaims()`.

**In `proxy.ts`, always return the original `supabaseResponse`** object. If you create a new `NextResponse`, you must manually copy cookies from the supabase response or sessions will break.

**Auth is session-based** via HTTP cookies (not JWT tokens in headers). The proxy handles cookie refresh automatically via `getClaims()`.

## Env vars

Copy `.env.example` to `.env.local` and set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

`hasEnvVars` in `lib/utils.ts` gates UI — the app shows setup instructions when vars are missing.

## shadcn/ui conventions

- Style: **new-york** (`components.json:3`)
- Icons: **lucide-react**
- Add components with `npx shadcn@latest add <component>` (they land in `components/ui/`)
- Class merging: use the `cn()` helper from `@/lib/utils` (twMerge + clsx)
- Dark mode: uses `next-themes` with `class` strategy — toggle via `<ThemeSwitcher>`
- See `.agents/skills/shadcn/` for complete shadcn/ui conventions (styling, forms, composition, icons)

## Paths

`@/*` maps to project root (not `src/`). All imports use this alias.

## Page protection

Two layers:
1. **`proxy.ts`** — catch-all redirect for unauthenticated users (except `/`, `/auth/*`, `/login`)
2. **Server-side check** — pages like `app/protected/page.tsx` call `getClaims()` server-side and `redirect()` if no session

## OpenSpec integration

Initialized with OpenCode support. Commands in `.opencode/commands/`, skills in `.opencode/skills/`.

Workflow: `/opsx:propose "idea"` → `/opsx:apply` → `/opsx:archive`

Changes live in `openspec/changes/`, specs in `openspec/specs/`.
