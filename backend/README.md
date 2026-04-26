# Mini Shop Backend

A RESTful API for a mini e-commerce shop built with **Node.js**, **Fastify**, **TypeScript**, and **Supabase** (PostgreSQL + Auth + Storage).

## Features

- 🔐 **Authentication** — Register, login, forgot password, JWT-protected routes
- 🛍️ **Products** — CRUD with image upload to Supabase Storage, search & category filtering
- 📦 **Orders** — Create orders, view order history, admin order management
- ✅ **Zod validation** on every route (body, params, query)
- 🔒 **Role-based access control** — Customer & Admin roles via JWT
- 📝 **Consistent error responses** — `{ statusCode, error, message }`
- 🗄️ **Row Level Security (RLS)** — Database-level access control

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A [Supabase](https://supabase.com/) project (free tier works)

---

## Setup

### 1. Clone & Install

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
PORT=3000
```

> **Where to find these values:**
> - Go to [Supabase Dashboard](https://app.supabase.com/) → Your Project → **Settings** → **API**
> - `SUPABASE_URL` = Project URL
> - `SUPABASE_ANON_KEY` = `anon` / `public` key
> - `SUPABASE_SERVICE_ROLE_KEY` = `service_role` key (keep secret!)
> - `JWT_SECRET` = JWT Secret

### 3. Set Up the Database

Open the **SQL Editor** in your Supabase Dashboard and run the contents of:

```
supabase-schema.sql
```

This creates all tables, enums, indexes, RLS policies, and the Storage bucket.

### 4. Seed the Database

```bash
npm run seed
```

This creates:
- **1 customer** account: `customer@test.com` / `password123`
- **1 admin** account: `admin@test.com` / `password123`
- **3 categories**: Electronics, Clothing, Food
- **12 products** spread across categories

---

## Running

### Development (with hot-reload)

```bash
npm run dev
```

### Production

```bash
npm start
```

The server starts on `http://localhost:3000` (or the PORT in your `.env`).

---

## API Endpoints

### Health Check

| Method | Endpoint   | Description         |
| ------ | ---------- | ------------------- |
| GET    | `/health`  | Server health check |

### Authentication

| Method | Endpoint              | Auth     | Description                     |
| ------ | --------------------- | -------- | ------------------------------- |
| POST   | `/auth/register`      | Public   | Register a new customer account |
| POST   | `/auth/login`         | Public   | Login → returns JWT             |
| POST   | `/auth/forgotpassword`| Public   | Send password reset email       |
| GET    | `/auth/me`            | Bearer   | Get current user profile        |

### Products

| Method | Endpoint         | Auth  | Description                                         |
| ------ | ---------------- | ----- | --------------------------------------------------- |
| GET    | `/products`      | Public| List products (`?search=`, `?category=`)            |
| GET    | `/products/:id`  | Public| Get single product                                  |
| POST   | `/products`      | Admin | Create product (multipart form w/ image)            |
| PATCH  | `/products/:id`  | Admin | Update product (multipart form w/ optional image)   |
| DELETE | `/products/:id`  | Admin | Soft-delete product (sets `is_active=false`)        |

### Orders

| Method | Endpoint                | Auth     | Description                              |
| ------ | ----------------------- | -------- | ---------------------------------------- |
| POST   | `/orders`               | Bearer   | Create order with items                  |
| GET    | `/orders/my`            | Bearer   | List own orders (sorted by date desc)    |
| GET    | `/orders`               | Admin    | Paginated list (`?page=&limit=&status=`) |
| PATCH  | `/orders/:id/status`    | Admin    | Update order status                      |

---

## Request / Response Examples

### Register

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"secret123"}'
```

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@test.com","password":"password123"}'
```

### Create Order

```bash
curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"product_id":"<UUID>","quantity":2}]}'
```

### Create Product (Admin, with image)

```bash
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -F "name=New Product" \
  -F "description=A great product" \
  -F "price=49.99" \
  -F "category_id=<UUID>" \
  -F "image=@./photo.jpg"
```

---

## Error Response Format

All errors follow a consistent shape:

```json
{
  "statusCode": 400,
  "error": "Validation Error",
  "message": "Product name is required"
}
```

---

## Project Structure (Modular Monolith)

Each domain lives in its own self-contained module under `src/modules/`.
A module owns its own **schema**, **service**, and **routes** — nothing leaks across boundaries.
Cross-cutting infrastructure (Supabase clients, auth middleware, shared types) lives in `src/shared/`.

```
backend/
├── src/
│   ├── modules/                        # ← Domain modules
│   │   ├── auth/                       #    Auth domain
│   │   │   ├── auth.schema.ts          #      Zod validation schemas
│   │   │   ├── auth.service.ts         #      Business logic
│   │   │   ├── auth.routes.ts          #      Fastify route handlers
│   │   │   └── index.ts               #      Barrel export
│   │   ├── products/                   #    Products domain
│   │   │   ├── products.schema.ts
│   │   │   ├── products.service.ts
│   │   │   ├── products.routes.ts
│   │   │   └── index.ts
│   │   └── orders/                     #    Orders domain
│   │       ├── orders.schema.ts
│   │       ├── orders.service.ts
│   │       ├── orders.routes.ts
│   │       └── index.ts
│   ├── shared/                         # ← Cross-cutting infrastructure
│   │   ├── plugins/
│   │   │   ├── supabase.ts             #      Supabase client init
│   │   │   └── auth.ts                 #      JWT verify & role guards
│   │   ├── schemas/
│   │   │   └── common.ts              #      Shared error response
│   │   └── index.ts                   #      Barrel export
│   └── server.ts                       # ← App entry point
├── .env.example
├── package.json
├── README.md
├── seed.ts                             # Database seeding script
├── supabase-schema.sql                 # Full DB schema + RLS
└── tsconfig.json
```

---

## Tech Stack

- **Runtime**: Node.js v18+
- **Framework**: Fastify v5
- **Language**: TypeScript
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth (JWT)
- **Storage**: Supabase Storage
- **Validation**: Zod
