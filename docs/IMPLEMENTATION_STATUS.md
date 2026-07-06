# Implementation Status

This document tracks what the Tech Gallery storefront has implemented against the
[`eshops_api`](../../../../eshops/eshops_api) backend it is built on.

> Backend: Go 1.23 + chi/v5 + PostgreSQL + Redis, JWT (HS256) auth. All routes are
> prefixed with `/api/v1` and resolve the tenant via the `Host` header.
> Tech Gallery points at `https://api.techgallerybd.com`.

_Last reviewed: 2026-06-22_

## Coverage: the storefront consumes the entire public API

Every customer-facing endpoint `eshops_api` exposes has a matching API module wired up.

| Backend domain | Endpoints | Storefront module | Status |
|---|---|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me`, `PATCH /auth/me` | `src/api/auth.ts` + `authStore` | ✅ wired |
| Products | `GET /products`, `GET /products/{id}` | `src/api/products.ts` | ✅ wired |
| Categories | `GET /categories` (flat/tree), `GET /categories/{id}` | `src/api/categories.ts` | ✅ wired |
| Brands | `GET /brands`, `GET /brands/{id}` | `src/api/brands.ts` | ✅ module exists |
| Bundles | `GET /bundles`, `GET /bundles/{id}` | `src/api/bundles.ts` | ✅ wired |
| Locations | `GET /locations/districts`, `GET /locations/districts/{id}/areas` | `src/api/locations.ts` | ✅ wired (shipping fees) |
| Orders | `GET /orders`, `GET /orders/{id}`, `POST /orders` | `src/api/orders.ts` + `cartStore` | ✅ wired |
| Incomplete orders | `POST /incomplete-orders` | `src/api/incompleteOrders.ts` | ✅ wired (phone-blur beacon) |
| Tracking | `POST /visits`, `POST /_track` | `src/api/tracking.ts` | ✅ wired |
| Settings | `GET /settings` (Meta Pixel, GA, GTM) | `src/api/settings.ts` | ✅ wired |

**API integration is effectively complete** — no backend storefront endpoint is left
unconsumed. The order-create flow maps cart → `variant_id`/`bundle_id` items, resolves
shipping from the selected district/area, and replays UTM/attribution data.

## UI-only / mocked (no backend behind it)

These exist in the frontend but the backend has **no matching endpoint**, so they are
static or local-only:

- **Product reviews & ratings** — `ProductDetailContent` renders sample reviews and a
  rating breakdown, but `eshops_api` exposes no reviews endpoint. Purely static.
- **Wishlist** — fully client-side (`wishlistStore` → localStorage). The backend has no
  wishlist API, so this is by design, not persisted server-side.
- **OTP login** — the second login tab is explicitly "coming soon"; no OTP endpoint
  exists backend-side.
- **Track-order page** — backend order reads (`GET /orders/{id}`) require auth; there is
  no public track-by-id endpoint, so this page cannot be backed by real data as-is.

## Worth a closer look

- **Brands** — the module is implemented, but the shop filters by spec-tags/price rather
  than `brand_id`. The brand API may be underused in the UI.
- **reCAPTCHA** — the backend's `POST /orders` expects a v3 token and rate-limits orders;
  per `CLAUDE.md` the storefront intentionally omits it. Confirm the backend tenant allows
  token-less orders.

## Tested

3 Vitest suites cover the money-path (cart → order payload → place order):

- `cartStore.test.ts` — add/merge/remove/update/clear, totals.
- `orderItems.test.ts` — cart → order-items mapper (`variant_id` vs `bundle_id`).
- `CartPage.test.tsx` — checkout integration (blocks order until district/area selected,
  correct payload, cart cleared post-order).

Browsing, auth, and dashboard flows have no tests yet.

## Backend rate limits (for reference)

| Scope | Limit |
|---|---|
| General API | 600 req/min per IP |
| Order creation | 30 req/min per IP |
| Auth | 10 req/min per IP |
| Incomplete order | 60 req/min per IP |
| Tracking | 120 req/min per IP |

Access token: JWT (HS256), 15 min expiry. Refresh token: opaque, 30 days, rotated on use.
