import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AuthLayout from '@/layouts/AuthLayout'
import MainLayout from '@/layouts/MainLayout'
import PosLayout from '@/layouts/PosLayout'
import KdsLayout from '@/layouts/KdsLayout'
import ProtectedRoute from '@/routes/ProtectedRoute'
import GuestRoute from '@/routes/GuestRoute'
import { RoleRoute } from '@/routes/RoleRoute'
import LoginPage from '@/modules/features/auth/LoginPage'
import SignupPage from '@/modules/features/auth/SignupPage'
import EmployeeRegisterPage from '@/modules/features/auth/EmployeeRegisterPage'
import DashboardPage from '@/modules/features/dashboard/DashboardPage'
import { PosPage } from '@/modules/features/pos/PosPage'
import OrdersPage from '@/modules/features/orders/OrdersPage'
import CustomersPage from '@/modules/features/customers/CustomersPage'
import ProductsPage from '@/modules/features/products/ProductsPage'
import CategoriesPage from '@/modules/features/categories/CategoriesPage'
import TablesPage from '@/modules/features/tables/TablesPage'
import PaymentsPage from '@/modules/features/payments/PaymentsPage'
import PromotionsPage from '@/modules/features/promotions/PromotionsPage'
import EmployeesPage from '@/modules/features/employees/EmployeesPage'
import { KdsPage } from '@/modules/features/kds/KdsPage'
import ReportsPage from '@/modules/features/reports/ReportsPage'
import BookingsPage from '@/modules/features/bookings/BookingsPage'
import SettingsPage from '@/modules/features/settings/SettingsPage'
import ProfilePage from '@/modules/features/profile/ProfilePage'
import RoleRedirect from '@/routes/RoleRedirect'

function ForgotPasswordPage() {
  return (
    <div className="text-center space-y-2">
      <h2 className="text-lg font-semibold">Forgot Password</h2>
      <p className="text-sm text-muted-foreground">
        Password reset is not available yet. Contact your administrator.
      </p>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    element: <KdsLayout />,
    children: [{ path: '/kds', element: <KdsPage /> }],
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [{ index: true, element: <RoleRedirect /> }],
  },
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/signup', element: <SignupPage /> },
          { path: '/register/employee', element: <EmployeeRegisterPage /> },
          { path: '/forgot-password', element: <ForgotPasswordPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute allowedRoles={['admin']} />,
        children: [
          {
            element: <MainLayout />,
            children: [
              { path: '/dashboard', element: <DashboardPage /> },
              { path: '/orders', element: <OrdersPage /> },
              { path: '/customers', element: <CustomersPage /> },
              { path: '/products', element: <ProductsPage /> },
              { path: '/categories', element: <CategoriesPage /> },
              { path: '/tables', element: <TablesPage /> },
              { path: '/payment-methods', element: <PaymentsPage /> },
              { path: '/promotions', element: <PromotionsPage /> },
              { path: '/employees', element: <EmployeesPage /> },
              { path: '/reports', element: <ReportsPage /> },
              { path: '/bookings', element: <BookingsPage /> },
              { path: '/settings', element: <SettingsPage /> },
              { path: '/profile', element: <ProfilePage /> },
            ],
          },
        ],
      },
      {
        element: <RoleRoute allowedRoles={['admin', 'cashier']} />,
        children: [
          {
            element: <PosLayout />,
            children: [{ path: '/pos', element: <PosPage /> }],
          },
        ],
      },
      { path: '*', element: <RoleRedirect /> },
    ],
  },
])

export function AppRoutes() {
  return <RouterProvider router={router} />
}
