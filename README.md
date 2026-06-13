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

### 4. Run the app

```bash
npm run dev
```

This starts both the API server (`http://localhost:5000`) and the frontend (`http://localhost:5173`).

### 5. Create your admin account

Open `http://localhost:5173/signup` and register. The first account you create becomes your admin login.

## Authentication

Login and signup authenticate against **MongoDB users** via the REST API:

- Passwords are hashed with bcrypt before storage
- JWT tokens are issued on successful login/signup (7-day expiry)
- Protected routes validate the session against `GET /api/auth/me`
- Signup creates a new **admin** account in MongoDB
- Employee (cashier) accounts are created by an admin from the Employees page

## Razorpay Payments

1. Get **Key ID** and **Key Secret** from [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys)
2. Admin → **Payment Methods** → configure Razorpay gateway and enable it
3. Or set in `server/.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=your_secret
   ```
4. In POS, Card/UPI/Razorpay open **Razorpay Checkout**; Cash remains manual

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
