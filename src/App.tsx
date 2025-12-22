import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { SuperAdminRoute } from '@/components/auth/ProtectedRoute'
import { PublicRoute } from '@/components/auth/PublicRoute'
import { LoadingFallback } from '@/components/ui/LoadingFallback'

// Lazy loaded pages - Auth
const LoginPage = lazy(() => import('@/pages/Login'))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPassword'))
const ResetPasswordPage = lazy(() => import('@/pages/ResetPassword'))

// Lazy loaded layouts
const SuperAdminLayout = lazy(() => import('@/components/layout/SuperAdminLayout').then(m => ({ default: m.SuperAdminLayout })))

// Lazy loaded pages - Super Admin
const SuperAdminDashboard = lazy(() => import('@/pages/super-admin/index'))
const OrganizationsPage = lazy(() => import('@/pages/super-admin/Organizations'))
const UsersPage = lazy(() => import('@/pages/super-admin/Users'))
const PermissionsPage = lazy(() => import('@/pages/super-admin/Permissions'))
const CurrenciesPage = lazy(() => import('@/pages/super-admin/Currencies'))
const PoolsPage = lazy(() => import('@/pages/super-admin/Pools'))
const WalletsPage = lazy(() => import('@/pages/super-admin/Wallets'))
const HardwarePage = lazy(() => import('@/pages/super-admin/Hardware'))
const WorkersPage = lazy(() => import('@/pages/super-admin/Workers'))
const PaymentsPage = lazy(() => import('@/pages/super-admin/Payments'))
const RevenuePage = lazy(() => import('@/pages/super-admin/Revenue'))
const AuditPage = lazy(() => import('@/pages/super-admin/Audit'))
const EndpointsPage = lazy(() => import('@/pages/super-admin/Endpoints'))
const RoundsPage = lazy(() => import('@/pages/super-admin/Rounds'))
const WebhooksPage = lazy(() => import('@/pages/super-admin/Webhooks'))
const PoolStatsPage = lazy(() => import('@/pages/super-admin/PoolStats'))

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
          <Route path="/reset-password" element={
            <Suspense fallback={<LoadingFallback />}>
              <ResetPasswordPage />
            </Suspense>
          } />

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
              <Suspense fallback={<LoadingFallback />}>
                <SuperAdminLayout />
              </Suspense>
            </SuperAdminRoute>
          }>
            <Route index element={<Suspense fallback={<LoadingFallback message="Carregando dashboard..." />}><SuperAdminDashboard /></Suspense>} />
            <Route path="organizations" element={<Suspense fallback={<LoadingFallback />}><OrganizationsPage /></Suspense>} />
            <Route path="users" element={<Suspense fallback={<LoadingFallback />}><UsersPage /></Suspense>} />
            <Route path="permissions" element={<Suspense fallback={<LoadingFallback />}><PermissionsPage /></Suspense>} />
            <Route path="currencies" element={<Suspense fallback={<LoadingFallback />}><CurrenciesPage /></Suspense>} />
            <Route path="pools" element={<Suspense fallback={<LoadingFallback />}><PoolsPage /></Suspense>} />
            <Route path="wallets" element={<Suspense fallback={<LoadingFallback />}><WalletsPage /></Suspense>} />
            <Route path="hardware" element={<Suspense fallback={<LoadingFallback />}><HardwarePage /></Suspense>} />
            <Route path="workers" element={<Suspense fallback={<LoadingFallback />}><WorkersPage /></Suspense>} />
            <Route path="payments" element={<Suspense fallback={<LoadingFallback />}><PaymentsPage /></Suspense>} />
            <Route path="revenue" element={<Suspense fallback={<LoadingFallback />}><RevenuePage /></Suspense>} />
            <Route path="audit" element={<Suspense fallback={<LoadingFallback />}><AuditPage /></Suspense>} />
            <Route path="endpoints" element={<Suspense fallback={<LoadingFallback />}><EndpointsPage /></Suspense>} />
            <Route path="rounds" element={<Suspense fallback={<LoadingFallback />}><RoundsPage /></Suspense>} />
            <Route path="webhooks" element={<Suspense fallback={<LoadingFallback />}><WebhooksPage /></Suspense>} />
            <Route path="pool-stats" element={<Suspense fallback={<LoadingFallback />}><PoolStatsPage /></Suspense>} />
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
