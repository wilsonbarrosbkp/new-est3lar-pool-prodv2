import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bell,Search } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { SidebarTrigger } from '@/components/ui/Sidebar'
import { typography } from '@/design-system/tokens'

// Mapeamento de rotas para breadcrumb
const routeLabels: Record<string, string> = {
  '/super-admin': 'Dashboard',
  '/super-admin/organizations': 'Organizações',
  '/super-admin/users': 'Usuários',
  '/super-admin/permissions': 'Permissões',
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

  const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1]

  return (
    <nav className={`flex items-center gap-1.5 sm:gap-2 ${typography.nav.breadcrumb} min-w-0`}>
      {/* Mobile: mostrar apenas a página atual */}
      <span className={`sm:hidden text-text-primary ${typography.weight.medium} truncate`}>
        {lastBreadcrumb?.label}
      </span>

      {/* Desktop: mostrar breadcrumb completo */}
      <div className="hidden sm:flex items-center gap-2">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.path} className="flex items-center gap-2">
            {index > 0 && <span className="text-text-secondary">/</span>}
            {index === breadcrumbs.length - 1 ? (
              <span className={`text-text-primary ${typography.weight.medium}`}>{crumb.label}</span>
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
      </div>
    </nav>
  )
}

export function Topbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="h-12 sm:h-14 flex items-center justify-between px-2 sm:px-4 border-b border-border bg-card">
      <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
        <SidebarTrigger />
        <div className="flex-1 min-w-0">
          <DynamicBreadcrumb />
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Search Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 sm:h-9 sm:w-9 p-0"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          aria-label="Pesquisar"
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative h-8 w-8 sm:h-9 sm:w-9 p-0">
          <Bell className="h-4 w-4" />
          <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 h-1.5 w-1.5 sm:h-2 sm:w-2 bg-error rounded-full" />
        </Button>
      </div>
    </header>
  )
}
