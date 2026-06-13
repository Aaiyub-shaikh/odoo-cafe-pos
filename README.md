# RestMana POS

Production-ready frontend-only Restaurant POS System inspired by Odoo POS.

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS + ShadCN UI
- React Router DOM + Zustand + TanStack Query
- React Hook Form + Zod + Recharts + Framer Motion

## Getting Started

```bash
npm install
npm run dev
```

## Demo Login

| Role | Credentials | After login |
|------|-------------|-------------|
| **Admin** | `admin@restmana.com` / `admin123` | Dashboard (backend management) |
| **Employee** | `sarah@restmana.com` / `cashier123` | POS session opens → floor table selection → order view |

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
| `/kds` | Kitchen Display |
| `/reports` | Reports |
| `/bookings` | Bookings |
| `/settings` | Settings |
| `/profile` | Profile |

## Project Structure

```
src/
├── app/           # App entry & providers
├── routes/        # Router configuration
├── layouts/       # Auth, Main, POS, KDS layouts
├── modules/features/  # Feature pages
├── components/    # UI & shared components
├── store/         # Zustand stores
├── mock/          # Mock data
├── types/         # TypeScript types
└── utils/         # Utilities
```
