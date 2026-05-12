# ShopProducts (front-end)

Frontend application built with Vue 3 + TypeScript + Vite for catalog browsing, authentication, and role-based dashboards (customer, vendor, admin).

## Tech Stack

- **Framework**: Vue 3 (`script setup`)
- **Language**: TypeScript
- **Build tool**: Vite
- **Routing**: Vue Router
- **State management**: Pinia
- **Server state / data fetching**: TanStack Vue Query + Axios
- **Validation**: Vee Validate + Zod
- **Testing**:
  - Unit/integration: Vitest + Testing Library
  - E2E: Cypress
- **Quality**: ESLint + Prettier + Husky + lint-staged
- **Release automation**: semantic-release (with conventional commit analysis)

## Environment Variables

Copy `.env.example` to `.env` and adjust values:

```bash
cp .env.example .env
```

Available keys:

- `VITE_API_BASE_URL` (required for API calls)
- `VITE_CURRENCY_SYMBOL`
- `VITE_SHIPPING_FEE`
- `VITE_FREE_SHIPPING_MIN_SUBTOTAL` (optional)
- `VITE_CHECKOUT_STORE_ID` (optional fallback)

## Local Development

Install dependencies:

```bash
npm ci
```

Start dev server:

```bash
npm run dev
```

App default URL:

- `http://127.0.0.1:5173` (CI/e2e target)
- `http://localhost:5173` (local default)

## Build and Preview

```bash
npm run build
npm run preview
```

## Testing

Run unit/integration tests:

```bash
npm test -- --run
```

Run Cypress headless:

```bash
npm run e2e
```

Run Cypress with automatic local server bootstrap:

```bash
npm run e2e:run
```

Open Cypress interactive runner:

```bash
npm run e2e:open
```

## User Journeys

### Guest Journey

1. Lands on `/` (home page).
2. Browses products (`/products`) and stores (`/stores`).
3. Can view details (`/products/:id`, `/stores/:id`).
4. Protected routes redirect to login with `redirect` query.

### Customer Journey

1. Registers at `/register` or signs in at `/login`.
2. Authenticated users are redirected from guest-only pages.
3. Accesses:
   - Profile (`/profile`)
   - Orders (`/account/orders`)
   - Order detail (`/account/orders/:orderId`)
   - Invoices (`/account/invoices`)
   - Account security (`/account/security`)
4. Creates and reviews own orders from customer flows.

### Vendor Journey

1. Signs in with role `vendor` (or `admin`).
2. Accesses `/vendor`.
3. Manages owned stores and products from vendor dashboard flows.
4. Non-vendor roles are blocked by route guards.

### Admin Journey

1. Signs in with role `admin`.
2. Accesses `/admin`.
3. Uses Admin Operations Console to manage:
   - users
   - stores
   - products
   - orders
   - invoices
   - logs
4. Non-admin users are blocked by route guards.

## Routing and Access Control

- Centralized in `src/app/router.ts`.
- Global guard initializes session before navigation.
- Supports:
  - `guestOnly` routes (`/login`, `/register`)
  - `requiresAuth` routes
  - role-restricted routes (`admin`, `vendor`)

## Release and Versioning

This repo uses `semantic-release` with conventional commits.

- `main`: stable releases (`x.y.z`)
- `dev`: prereleases (`x.y.z-dev.N`)

Configuration:

- `.releaserc.json`
- `.github/workflows/semantic-release.yml`

To run locally in dry mode:

```bash
npx semantic-release --dry-run --no-ci
```

## Docker

Build image:

```bash
docker build -t frontend-dae --build-arg VITE_API_BASE_URL=http://localhost:8000 .
```

Run container:

```bash
docker run --rm -p 8888:80 frontend-dae
```

App URL:

- `http://localhost:8888`
