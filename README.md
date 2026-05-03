# E‑commerce template (user + admin)

Monorepo-style base for freelance shops: a **customer storefront** and an **admin console** both talk to the **same SQLite database** (via Prisma). Admins manage products and promotions; the storefront reads active catalog data and live offers.

## Framework choice (Angular)

Frontends use **Angular 19** (standalone components, typed templates, CLI builds). **React** still leads many job boards and greenfield startups, while **Angular** is common in larger enterprises and teams that want strong structure. For client work, both are viable: pick Angular when the client expects a “full framework” stack and long-lived internal apps; pick React when you want the widest contractor pool and ecosystem density. This template standardizes on **Angular** for both apps.

## Layout

| Area | Frontend | Backend | Role |
|------|----------|---------|------|
| User | `user/frontend` (Angular, port **4200**) | `user/backend` (Express, port **3001**) | Public catalog, categories, promotions |
| Admin | `admin/frontend` (Angular, port **4300**) | `admin/backend` (Express + JWT, port **3002**) | Login, CRUD products & promotions (full UI) |

Shared: `prisma/schema.prisma` at the repo root, `DATABASE_URL` in `.env`.

## Setup

```bash
cd sample_agency
npm install
npx prisma db push
npm run db:seed
```

Copy `.env.example` to `.env` if you do not already have one, and set `JWT_SECRET` for production.

## Dev

- **Storefront + user API:** `npm run dev:user`
- **Admin UI + admin API:** `npm run dev:admin`
- **All four processes:** `npm run dev:all`

Then open `http://localhost:4200` (shop) and `http://localhost:4300` (admin).

### Seeded admin (demo only)

- Email: `admin@demo.local`
- Password: `admin123`

Change this account or auth in real deployments.

## API URLs in Angular

Defaults are set in:

- `user/frontend/src/environments/environment.ts` → `userApiUrl` (default `http://localhost:3001`)
- `admin/frontend/src/environments/environment.ts` → `adminApiUrl` (default `http://localhost:3002`)

Use Angular `fileReplacements` in `angular.json` for production builds if you deploy APIs on different hosts.

## Next steps for client projects

- Replace branding, colors, and copy in both Angular apps.
- Add payments, cart persistence, and email; this template stops at catalog + admin CRUD.
- Point `DATABASE_URL` at PostgreSQL for production and run migrations instead of `db push`.
