import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Bell } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SidebarTrigger } from '@/components/ui/Sidebar'

// Mapeamento de rotas para breadcrumb
const routeLabels: Record<string, string> = {
  '/super-admin': 'Dashboard',
  '/super-admin/organizations': 'Organizacoes',
  '/super-admin/users': 'Usuarios',
  '/super-admin/permissions': 'Permissoes',
  '/super-admin/currencies': 'Moedas',
  '/super-admin/pools': 'Pools',
  '/super-admin/wallets': 'Carteiras',
  '/super-admin/hardware': 'Hardware',
  '/super-admin/workers': 'Workers',
  '/super-admin/payments': 'Pagamentos',
  '/super-admin/revenue': 'Revenue',
  '/super-admin/audit': 'Auditoria',
  '/super-admin/endpoints': 'Endpoints',
  '/super-admin/rounds': 'Rounds',
  '/super-admin/webhooks': 'Webhooks',
}

function DynamicBreadcrumb() {
  const location = useLocation()

  const pathSegments = location.pathname.split('/').filter(Boolean)
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/')
    const label = routeLabels[path] || segment
    return { path, label }
  })

  return (
    <nav className="flex items-center gap-2 text-sm">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center gap-2">
          {index > 0 && <span className="text-text-secondary">/</span>}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-text-primary font-medium">{crumb.label}</span>
          ) : (
            <Link
              to={crumb.path}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}

export function Topbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-card">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <SidebarTrigger />
        <div className="flex-1 min-w-0">
          <DynamicBreadcrumb />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search Button */}
        <Button
          variant="ghost"
          size="sm"
          className="hidden md:flex"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          aria-label="Pesquisar"
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Mobile Search Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          aria-label="Abrir pesquisa"
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-error rounded-full" />
        </Button>
      </div>
    </header>
  )
}
