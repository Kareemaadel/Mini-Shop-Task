# Mini Shop Admin Dashboard

Admin dashboard for managing the Mini Shop — products, orders, and analytics.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** — dev server and bundler
- **Tailwind CSS v4** — utility-first styling
- **React Router v7** — client-side routing
- **Axios** — HTTP client
- **react-hot-toast** — toast notifications
- **Heroicons** — icon system

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Backend server running on `http://localhost:3000`

### Install

```bash
cd dashboard
npm install
```

### Configure

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` if your backend is on a different URL:

```
VITE_API_URL=http://localhost:3000
```

### Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

## Test Credentials

| Role  | Email            | Password      |
|-------|------------------|---------------|
| Admin | admin@test.com   | password123   |

> Customer accounts (`customer@test.com`) will be denied access — admin-only dashboard.

## Features

- **Dashboard** — KPI cards (orders today, revenue, active products, total orders)
- **Products** — full CRUD with image upload, active/inactive toggle, and delete confirmation
- **Orders** — paginated list with status filter tabs, inline status update, and order detail modal
- **Auth** — JWT login with admin role enforcement, auto-logout on token expiry

## Project Structure

```
dashboard/
├── src/
│   ├── components/    # Reusable UI (Modal, Sidebar, KPICard, etc.)
│   ├── pages/         # Page components (Dashboard, Products, Orders, Login)
│   ├── services/      # API service modules (auth, products, orders)
│   ├── App.tsx        # Route definitions
│   ├── main.tsx       # Entry point
│   └── index.css      # Tailwind imports & theme
├── .env.example
├── index.html
├── vite.config.ts
└── package.json
```
