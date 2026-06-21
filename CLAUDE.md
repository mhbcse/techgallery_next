# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `npm run dev` (Next.js dev server)
- **Build:** `npm run build` (Next.js build)
- **Deploy to Cloudflare:** `opennextjs-cloudflare build && npx wrangler deploy` (avoid `npm run deploy` — known EPIPE bug with miniflare)
- No test runner or linter is configured.

## Architecture

Next.js 14 + TypeScript SSR app for a kids' fashion e-commerce storefront ("Baby Gallery"). Deployed on Cloudflare Workers via `@opennextjs/cloudflare`. Uses Tailwind CSS 3 and the `Plus Jakarta Sans` font. Currency is BDT (৳).

### Routing (Next.js App Router)

Route groups defined in `app/` directory:
- **(main)** — public pages: `/`, `/shop`, `/products/:id`, `/cart`, `/wishlist`
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

- `NEXT_PUBLIC_API_BASE_URL` — backend API base URL
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` — Google reCAPTCHA v3 site key (used during order creation)
