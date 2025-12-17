import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Toaster } from 'sonner'
import LoginPage from '@/pages/Login'
import ForgotPasswordPage from '@/pages/ForgotPassword'
import ResetPasswordPage from '@/pages/ResetPassword'
import { SuperAdminLayout } from '@/components/layout/SuperAdminLayout'
import SuperAdminDashboard from '@/pages/super-admin/index'
import OrganizationsPage from '@/pages/super-admin/Organizations'

// Placeholder para páginas ainda não implementadas
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <h1 className="text-2xl font-bold text-text-primary mb-2">{title}</h1>
      <p className="text-text-secondary">Em desenvolvimento</p>
    </div>
  )
}

function DevNavigation() {
  const pages = [
    { path: '/login', label: 'Login', description: 'Pagina de login com email e senha' },
    { path: '/forgot-password', label: 'Esqueci a Senha', description: 'Formulario de recuperacao de senha' },
    { path: '/reset-password', label: 'Redefinir Senha', description: 'Formulario para criar nova senha' },
    { path: '/dashboard', label: 'Dashboard', description: 'Area do usuario (placeholder)' },
    { path: '/super-admin', label: 'Super Admin', description: 'Painel administrativo do sistema' },
  ]

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <img src="/Est3lar-Colors.png" alt="Est3lar" className="h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Dev Navigation</h1>
          <p className="text-[#94A3B8]">Navegue livremente entre as paginas</p>
        </div>

        <div className="grid gap-4">
          {pages.map((page) => (
            <Link
              key={page.path}
              to={page.path}
              className="block p-4 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#0F1720] hover:bg-[#0F1720]/80 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white font-medium">{page.label}</h2>
                  <p className="text-sm text-[#94A3B8]">{page.description}</p>
                </div>
                <code className="text-xs text-[#94A3B8] bg-[#0B0F14] px-2 py-1 rounded">{page.path}</code>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Dev navigation page */}
        <Route path="/" element={<DevNavigation />} />

        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Dashboard placeholder */}
        <Route path="/dashboard" element={<div className="min-h-screen p-8"><div className="max-w-4xl mx-auto"><Link to="/" className="text-[#94A3B8] hover:text-white mb-4 inline-block">&larr; Voltar</Link><h1 className="text-2xl font-bold text-white">Dashboard</h1><p className="text-[#94A3B8] mt-2">Em desenvolvimento</p></div></div>} />

        {/* Super Admin routes */}
        <Route path="/super-admin" element={<SuperAdminLayout />}>
          <Route index element={<SuperAdminDashboard />} />
          <Route path="organizations" element={<OrganizationsPage />} />
          <Route path="users" element={<PlaceholderPage title="Usuários" />} />
          <Route path="permissions" element={<PlaceholderPage title="Permissões" />} />
          <Route path="currencies" element={<PlaceholderPage title="Moedas" />} />
          <Route path="pools" element={<PlaceholderPage title="Pools" />} />
          <Route path="wallets" element={<PlaceholderPage title="Carteiras" />} />
          <Route path="hardware" element={<PlaceholderPage title="Hardware" />} />
          <Route path="workers" element={<PlaceholderPage title="Workers" />} />
          <Route path="payments" element={<PlaceholderPage title="Pagamentos" />} />
          <Route path="revenue" element={<PlaceholderPage title="Revenue" />} />
          <Route path="audit" element={<PlaceholderPage title="Auditoria" />} />
          <Route path="endpoints" element={<PlaceholderPage title="Endpoints" />} />
          <Route path="rounds" element={<PlaceholderPage title="Rounds" />} />
          <Route path="webhooks" element={<PlaceholderPage title="Webhooks" />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<div className="min-h-screen p-8 text-center"><h1 className="text-2xl font-bold text-white mb-4">404 - Pagina nao encontrada</h1><Link to="/" className="text-[#94A3B8] hover:text-white">Voltar para navegacao</Link></div>} />
      </Routes>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        expand={false}
        richColors
        closeButton
      />
    </BrowserRouter>
  )
}

export default App
