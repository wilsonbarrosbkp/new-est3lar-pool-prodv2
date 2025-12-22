import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { SuperAdminRoute } from '@/components/auth/ProtectedRoute'
import { PublicRoute } from '@/components/auth/PublicRoute'
import { LoadingFallback } from '@/components/ui/LoadingFallback'

// Lazy loaded pages
const LoginPage = lazy(() => import('@/pages/Login'))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPassword'))
import ResetPasswordPage from '@/pages/ResetPassword'
import { SuperAdminLayout } from '@/components/layout/SuperAdminLayout'
import SuperAdminDashboard from '@/pages/super-admin/index'
import OrganizationsPage from '@/pages/super-admin/Organizations'
import UsersPage from '@/pages/super-admin/Users'
import PermissionsPage from '@/pages/super-admin/Permissions'
import CurrenciesPage from '@/pages/super-admin/Currencies'
import PoolsPage from '@/pages/super-admin/Pools'
import WalletsPage from '@/pages/super-admin/Wallets'
import HardwarePage from '@/pages/super-admin/Hardware'
import WorkersPage from '@/pages/super-admin/Workers'
import PaymentsPage from '@/pages/super-admin/Payments'
import RevenuePage from '@/pages/super-admin/Revenue'
import AuditPage from '@/pages/super-admin/Audit'
import EndpointsPage from '@/pages/super-admin/Endpoints'
import RoundsPage from '@/pages/super-admin/Rounds'
import WebhooksPage from '@/pages/super-admin/Webhooks'
import PoolStatsPage from '@/pages/super-admin/PoolStats'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Root redirects to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public routes - redirect to dashboard if already logged in */}
          <Route path="/login" element={
            <PublicRoute>
              <Suspense fallback={<LoadingFallback />}>
                <LoginPage />
              </Suspense>
            </PublicRoute>
          } />
          <Route path="/forgot-password" element={
            <PublicRoute>
              <Suspense fallback={<LoadingFallback />}>
                <ForgotPasswordPage />
              </Suspense>
            </PublicRoute>
          } />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Dashboard for Org Miner (role_id: 3) */}
          <Route path="/dashboard" element={
            <div className="min-h-screen p-8">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-white">Dashboard Minerador</h1>
                <p className="text-[#94A3B8] mt-2">Em desenvolvimento</p>
              </div>
            </div>
          } />

          {/* Org Admin area (role_id: 2) */}
          <Route path="/org-admin" element={
            <div className="min-h-screen p-8">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-white">Painel Administrador</h1>
                <p className="text-[#94A3B8] mt-2">Em desenvolvimento</p>
              </div>
            </div>
          } />

          {/* Super Admin routes - protected */}
          <Route path="/super-admin" element={
            <SuperAdminRoute>
              <SuperAdminLayout />
            </SuperAdminRoute>
          }>
            <Route index element={<SuperAdminDashboard />} />
            <Route path="organizations" element={<OrganizationsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="permissions" element={<PermissionsPage />} />
            <Route path="currencies" element={<CurrenciesPage />} />
            <Route path="pools" element={<PoolsPage />} />
            <Route path="wallets" element={<WalletsPage />} />
            <Route path="hardware" element={<HardwarePage />} />
            <Route path="workers" element={<WorkersPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="revenue" element={<RevenuePage />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="endpoints" element={<EndpointsPage />} />
            <Route path="rounds" element={<RoundsPage />} />
            <Route path="webhooks" element={<WebhooksPage />} />
            <Route path="pool-stats" element={<PoolStatsPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-screen p-8 text-center">
              <h1 className="text-2xl font-bold text-white mb-4">404 - Pagina nao encontrada</h1>
              <Link to="/login" className="text-[#94A3B8] hover:text-white">Voltar para login</Link>
            </div>
          } />
        </Routes>

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          expand={false}
          richColors
          closeButton
        />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
