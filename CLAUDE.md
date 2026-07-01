# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `npm run dev` (Next.js dev server)
- **Build:** `npm run build` (Next.js build)
- **Deploy to Cloudflare:** `NEXT_PUBLIC_API_BASE_URL=https://api.techgallerybd.com opennextjs-cloudflare build && npx wrangler deploy` (avoid `npm run deploy` — known EPIPE bug with miniflare). The `NEXT_PUBLIC_API_BASE_URL` prefix is **required**: this var is inlined at build time, and Next.js loads `.env.local` (which holds the local dev API URL) with higher precedence than `.env`, so a plain build bakes the local URL into production. Setting it as a shell var overrides `.env.local`. Verify with `grep -roh "api.techgallerybd[a-z:.0-9]*" .open-next/assets/_next/static | sort | uniq -c` before deploying.
- **Tests:** `npm test` (Vitest, run once) or `npm run test:watch`. Vitest + Testing Library; config in `vitest.config.ts`, setup in `vitest.setup.ts`. Test files (`*.test.ts[x]`) live next to the code and are excluded from the Next/TS build via `tsconfig.json`.
- No linter is configured.

## Architecture

Next.js 14 + TypeScript SSR app for a high-performance PC-peripherals e-commerce storefront ("Tech Gallery" — keyboards, mice, audio gear). Deployed on Cloudflare Workers via `@opennextjs/cloudflare`. Uses Tailwind CSS 3 with an industrial/tech design system (brand accent `#007bff`) and the Hanken Grotesk (display/headlines), Inter (body), and JetBrains Mono (labels) fonts. Currency is BDT (৳).

The storefront is multi-tenant on a shared backend that resolves the store by `Host` header; Tech Gallery points at `https://api.techgallerybd.com`. The UI was built from the mockups in `../ui/` and shares its architecture with the sibling Baby Gallery app.

### Routing (Next.js App Router)

Route groups defined in `app/` directory:
- **(main)** — public pages: `/`, `/shop`, `/shop/:categorySlug`, `/products/:id`, `/bundles`, `/cart` (cart + checkout), `/wishlist`, `/track-order`, `/contact`
- **(auth)** — `/login`, `/register`
- **(dashboard)** — `/account/*` pages (orders, profile, wishlist)

### State Management (Zustand + persist)

All stores use `zustand/middleware/persist` to localStorage:
- `authStore` — user, JWT tokens (key: `auth-storage`)
- `cartStore` — cart items keyed by variantId (key: `cart-storage`)
- `wishlistStore` — wishlist items keyed by productId (key: `wishlist-storage`)

### API Layer

- `src/api/client.ts` — Axios instance with base URL from `NEXT_PUBLIC_API_BASE_URL`. Attaches Bearer token from localStorage and handles 401 refresh-token rotation with a queue for concurrent requests.
- `src/api/server.ts` — Server-side fetch helper for Next.js server components.
- API modules (`auth.ts`, `products.ts`, `categories.ts`, `brands.ts`, `orders.ts`) call REST endpoints under `/api/v1/`.
- Response shapes: `PaginatedResponse<T>` (with `meta: Pagination`) and `SingleResponse<T>` defined in `src/api/types.ts`.

### Form Validation

Zod schemas in `src/lib/validators.ts` with `react-hook-form` + `@hookform/resolvers`.

### Path Alias

`@/*` maps to `src/*` (configured in `tsconfig.json`).

### Environment Variables

- `NEXT_PUBLIC_API_BASE_URL` — backend API base URL (defaults to `https://api.techgallerybd.com`)

reCAPTCHA is intentionally not used; orders are created without a token.
