import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Toaster } from 'sonner'
import LoginPage from '@/pages/Login'
import ForgotPasswordPage from '@/pages/ForgotPassword'
import ResetPasswordPage from '@/pages/ResetPassword'

function DevNavigation() {
  const pages = [
    { path: '/login', label: 'Login', description: 'Pagina de login com email e senha' },
    { path: '/forgot-password', label: 'Esqueci a Senha', description: 'Formulario de recuperacao de senha' },
    { path: '/reset-password', label: 'Redefinir Senha', description: 'Formulario para criar nova senha' },
    { path: '/dashboard', label: 'Dashboard', description: 'Area do usuario (placeholder)' },
    { path: '/super-admin', label: 'Super Admin', description: 'Area administrativa (placeholder)' },
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

        {/* Placeholder for future routes */}
        <Route path="/dashboard" element={<div className="min-h-screen p-8"><div className="max-w-4xl mx-auto"><Link to="/" className="text-[#94A3B8] hover:text-white mb-4 inline-block">&larr; Voltar</Link><h1 className="text-2xl font-bold text-white">Dashboard</h1><p className="text-[#94A3B8] mt-2">Em desenvolvimento</p></div></div>} />
        <Route path="/super-admin" element={<div className="min-h-screen p-8"><div className="max-w-4xl mx-auto"><Link to="/" className="text-[#94A3B8] hover:text-white mb-4 inline-block">&larr; Voltar</Link><h1 className="text-2xl font-bold text-white">Super Admin</h1><p className="text-[#94A3B8] mt-2">Em desenvolvimento</p></div></div>} />

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
