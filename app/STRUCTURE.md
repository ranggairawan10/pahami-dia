# PAHAMI DIA: Project Structure
## Next.js App Router | TypeScript | Tailwind CSS | Supabase

```
pahami-dia/
├── .env.example                    # Template environment variables
├── .env.local                      # Local environment (tidak di-commit)
├── next.config.ts                  # Next.js configuration
├── tailwind.config.ts              # Tailwind design system
├── postcss.config.mjs
├── tsconfig.json
├── package.json
│
└── src/
    ├── middleware.ts               # Supabase auth session refresh + route guards
    │
    ├── types/
    │   └── database.ts             # TypeScript interfaces untuk semua tabel
    │
    ├── lib/
    │   ├── supabase/
    │   │   ├── browser.ts          # createBrowserClient (use client)
    │   │   ├── server.ts           # createServerClient dengan cookies (server)
    │   │   └── admin.ts            # Service role client (server-only, bypasses RLS)
    │   │
    │   ├── auth/
    │   │   ├── helpers.ts          # getUser, getProfile, requireAuth, route guards
    │   │   ├── roles.ts            # isAdmin, isSuperAdmin, isPartnerAdmin, getRoleContext
    │   │   └── access.ts           # hasActiveTrial, hasActiveSubscription, hasActiveAccess
    │   │
    │   ├── schemas/
    │   │   └── common.ts           # Zod schemas: auth, onboarding, fitur, partner
    │   │
    │   └── utils/
    │       ├── format.ts           # formatCurrencyIDR, formatDate, getGreeting, dll
    │       └── cn.ts               # clsx + tailwind-merge helper
    │
    ├── app/
    │   ├── globals.css             # Tailwind directives + CSS custom properties
    │   ├── layout.tsx              # Root layout: font, metadata, viewport
    │   │
    │   ├── (public)/               # Halaman publik tanpa auth
    │   │   ├── layout.tsx          # Public layout: navbar + footer
    │   │   ├── page.tsx            # Landing page (/)
    │   │   ├── harga/
    │   │   │   └── page.tsx        # Pricing page
    │   │   ├── komunitas-partner/
    │   │   │   └── page.tsx        # Partner registration page
    │   │   ├── ketentuan/
    │   │   │   └── page.tsx
    │   │   ├── privasi/
    │   │   │   └── page.tsx
    │   │   └── bantuan/
    │   │       └── page.tsx
    │   │
    │   ├── (auth)/                 # Halaman autentikasi (guest only)
    │   │   ├── layout.tsx          # Auth layout: centered, minimal
    │   │   ├── masuk/
    │   │   │   └── page.tsx        # Login
    │   │   ├── daftar/
    │   │   │   └── page.tsx        # Register
    │   │   └── lupa-password/
    │   │       └── page.tsx
    │   │
    │   ├── (app)/                  # User app (requires auth)
    │   │   ├── layout.tsx          # App layout: header + bottom nav + trial banner
    │   │   ├── hari-ini/
    │   │   │   └── page.tsx        # Hub utama (home)
    │   │   ├── pahami-kalimatnya/
    │   │   │   └── page.tsx
    │   │   ├── jawab-dengan-tenang/
    │   │   │   └── page.tsx
    │   │   ├── aku-merasa-sendirian/
    │   │   │   └── page.tsx
    │   │   ├── aku-merasa-buntu/
    │   │   │   └── page.tsx
    │   │   ├── perbaiki-setelah-salah-bicara/
    │   │   │   └── page.tsx
    │   │   ├── beban-tak-terlihat/
    │   │   │   └── page.tsx
    │   │   ├── ayat-pengingat/
    │   │   │   ├── page.tsx        # Ayat list
    │   │   │   └── [id]/
    │   │   │       └── page.tsx    # Detail ayat
    │   │   ├── refleksi-harian/
    │   │   │   ├── page.tsx        # Today's journal
    │   │   │   └── [id]/
    │   │   │       └── page.tsx    # Past entry
    │   │   ├── riwayat/
    │   │   │   └── page.tsx        # Saved items history
    │   │   ├── subscription/
    │   │   │   ├── page.tsx        # Subscription management
    │   │   │   └── checkout/
    │   │   │       └── page.tsx    # Payment checkout (future)
    │   │   ├── onboarding/
    │   │   │   └── page.tsx        # First-time onboarding flow
    │   │   └── account/
    │   │       ├── page.tsx        # Account overview
    │   │       ├── profil/
    │   │       │   └── page.tsx
    │   │       ├── notifikasi/
    │   │       │   └── page.tsx
    │   │       └── privasi/
    │   │           └── page.tsx
    │   │
    │   ├── (admin)/                # Platform admin (requires admin role)
    │   │   ├── layout.tsx          # Admin layout: sidebar navigation
    │   │   ├── admin/
    │   │   │   ├── page.tsx        # Dashboard
    │   │   │   ├── users/
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── [id]/
    │   │   │   │       └── page.tsx
    │   │   │   ├── subscriptions/
    │   │   │   │   └── page.tsx
    │   │   │   ├── payments/
    │   │   │   │   └── page.tsx
    │   │   │   ├── partners/
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── [id]/
    │   │   │   │       └── page.tsx
    │   │   │   ├── partner-codes/
    │   │   │   │   └── page.tsx
    │   │   │   ├── quran-verses/
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── [id]/
    │   │   │   │       └── page.tsx
    │   │   │   ├── conditions/
    │   │   │   │   └── page.tsx
    │   │   │   ├── prompt-templates/   # super_admin only
    │   │   │   │   └── page.tsx
    │   │   │   ├── safety-events/
    │   │   │   │   ├── page.tsx
    │   │   │   │   └── [id]/
    │   │   │   │       └── page.tsx
    │   │   │   ├── audit-logs/
    │   │   │   │   └── page.tsx
    │   │   │   └── settings/           # super_admin only
    │   │   │       └── page.tsx
    │   │
    │   ├── (partner)/              # Partner admin (requires partner_admin role)
    │   │   ├── layout.tsx          # Partner layout: top tab navigation
    │   │   ├── partner/
    │   │   │   ├── page.tsx        # Dashboard
    │   │   │   ├── referrals/
    │   │   │   │   └── page.tsx
    │   │   │   ├── revenue/
    │   │   │   │   └── page.tsx
    │   │   │   ├── campaigns/
    │   │   │   │   └── page.tsx
    │   │   │   └── payouts/
    │   │   │       └── page.tsx
    │   │
    │   └── api/                    # API Route Handlers
    │       ├── auth/
    │       │   └── callback/
    │       │       └── route.ts    # Supabase OAuth callback
    │       └── webhooks/
    │           └── payment/
    │               └── route.ts    # Payment gateway webhook (future)
    │
    └── components/
        ├── ui/                     # Reusable UI components
        │   ├── index.ts            # Barrel export
        │   ├── Button.tsx          # Button + LoadingSpinner
        │   ├── Card.tsx            # Card + sub-components
        │   ├── Input.tsx           # Input + Textarea + Select + Field
        │   ├── Alert.tsx           # Badge + Alert + LoadingState + EmptyState + ErrorState
        │   └── SafetyNotice.tsx    # TrialBanner + PaywallCard + SafetyNotice
        │
        ├── features/               # Feature-specific components (belum dibuat)
        │   ├── hari-ini/
        │   ├── pahami-kalimatnya/
        │   ├── refleksi-harian/
        │   └── ...
        │
        └── shared/                 # Shared components (belum dibuat)
            ├── PageHeader.tsx
            ├── FeatureCard.tsx
            └── ...
```

## Konvensi Penamaan

- **Komponen**: PascalCase (`Button.tsx`, `TrialBanner.tsx`)
- **Halaman**: `page.tsx` (Next.js App Router convention)
- **Layout**: `layout.tsx`
- **Utilities**: camelCase (`format.ts`, `cn.ts`)
- **Types**: PascalCase interfaces, camelCase variables

## Data Flow

```
Browser Request
    ↓
middleware.ts          (auth session refresh + route guards)
    ↓
layout.tsx             (server: getUser, getProfile, getAccessInfo)
    ↓
page.tsx               (server: fetch page-specific data)
    ↓
'use client' component (browser: form, interaction, AI call)
    ↓
/api/... route         (server: process, call AI, update DB)
    ↓
Supabase              (RLS enforced at database level)
```

## Environment Variables

| Variable | Access | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + Server | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + Server | Anon key (RLS enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Service role (bypasses RLS) |
| `NEXT_PUBLIC_APP_URL` | Browser + Server | Base URL |
| `NEXT_PUBLIC_APP_NAME` | Browser + Server | App name |
