# Café Luxe

Restaurant Point of Sale System with React frontend and MongoDB backend.

## Tech Stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS, ShadCN UI, Zustand, React Router, Recharts

**Backend:** Express 5, Mongoose, MongoDB, JWT auth

## Prerequisites

- Node.js 18+
- MongoDB running locally (default: `mongodb://127.0.0.1:27017/rest_mana`)

## Getting Started

### 1. Install dependencies

```bash
npm install
cd server && npm install && cd ..
```

### 2. Configure backend

```bash
cp server/.env.example server/.env
```

Edit `server/.env` if your MongoDB URI or port differs.

### 3. Seed the database

```bash
npm run seed
```

### 4. Run frontend + backend together

```bash
npm run dev:all
```

Or run separately:

```bash
npm run dev:server   # API at http://localhost:5000
npm run dev          # Frontend at http://localhost:5173
```

## Demo Login

| Role | Credentials | After login |
|------|-------------|-------------|
| **Admin** | `admin@restmana.com` / `admin123` | Dashboard (backend management) |
| **Employee** | `sarah@restmana.com` / `cashier123` | POS session → floor table selection → order view |

## Routes

| Route | Module |
|-------|--------|
| `/login` | Login |
| `/signup` | Signup |
| `/dashboard` | Analytics Dashboard |
| `/pos` | POS Terminal |
| `/orders` | Orders |
| `/customers` | Customers |
| `/products` | Products |
| `/categories` | Categories |
| `/tables` | Floor & Tables |
| `/payment-methods` | Payment Methods |
| `/promotions` | Coupons & Promotions |
| `/employees` | Employees |
| `/kds` | Kitchen Display (`http://localhost:5173/kds`) |
| `/reports` | Reports |
| `/bookings` | Bookings |
| `/settings` | Settings |
| `/profile` | Profile |

## Project Structure

```
src/                 # React frontend
├── app/             # App entry & providers
├── routes/          # Router configuration
├── layouts/         # Auth, Main, POS, KDS layouts
├── modules/features/# Feature pages
├── components/      # UI & shared components
├── store/           # Zustand stores (API-backed)
├── services/api.ts  # MongoDB API client
├── types/           # TypeScript types
└── utils/           # Utilities

server/              # Express + Mongoose API
├── src/models/      # MongoDB schemas
├── src/routes/      # REST endpoints
└── src/seed.ts      # Database seed script
```

## API

All frontend data operations go through `/api/*`, proxied to the backend in development. Authentication uses JWT stored in localStorage.

Health check: `GET http://localhost:5000/api/health`
