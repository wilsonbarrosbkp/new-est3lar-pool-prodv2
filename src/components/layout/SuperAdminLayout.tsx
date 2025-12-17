import { Outlet } from 'react-router-dom'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/Sidebar'
import { Topbar } from './Topbar'
import type { NavItem } from '@/components/nav-main'
import type { NavUserProps } from '@/components/nav-user'

// Mock user - sera substituido por dados reais do Supabase
const mockUser: NavUserProps = {
  name: 'Super Admin',
  email: 'admin@est3lar.com',
  role: 'Super Admin',
}

// Super Admin navigation items
const superAdminNavItems: NavItem[] = [
  { title: 'Dashboard', url: '/super-admin', iconName: 'LayoutDashboard' },
  { title: 'Organizacoes', url: '/super-admin/organizations', iconName: 'Building' },
  { title: 'Usuarios', url: '/super-admin/users', iconName: 'UserCog' },
  { title: 'Permissoes', url: '/super-admin/permissions', iconName: 'Shield' },
  { title: 'Moedas', url: '/super-admin/currencies', iconName: 'Coins' },
  { title: 'Pools', url: '/super-admin/pools', iconName: 'Database' },
  { title: 'Carteiras', url: '/super-admin/wallets', iconName: 'Wallet' },
  { title: 'Hardware', url: '/super-admin/hardware', iconName: 'BarChart3' },
  { title: 'Workers', url: '/super-admin/workers', iconName: 'Users' },
  { title: 'Pagamentos', url: '/super-admin/payments', iconName: 'CreditCard' },
  { title: 'Revenue', url: '/super-admin/revenue', iconName: 'TrendingUp' },
  { title: 'Auditoria', url: '/super-admin/audit', iconName: 'FileText' },
  { title: 'Endpoints', url: '/super-admin/endpoints', iconName: 'Globe' },
  { title: 'Rounds', url: '/super-admin/rounds', iconName: 'RotateCcw' },
  { title: 'Webhooks', url: '/super-admin/webhooks', iconName: 'Webhook' },
]

export function SuperAdminLayout() {
  return (
    <SidebarProvider>
      <AppSidebar user={mockUser} navItems={superAdminNavItems} />
      <SidebarInset>
        <Topbar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
