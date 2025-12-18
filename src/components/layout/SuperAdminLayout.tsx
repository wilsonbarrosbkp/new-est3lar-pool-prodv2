import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/Sidebar'
import { Topbar } from './Topbar'
import type { NavItem } from '@/components/nav-main'
import type { NavUserProps } from '@/components/nav-user'
import { supabase } from '@/lib/supabase/client'

// Super Admin navigation items
const superAdminNavItems: NavItem[] = [
  { title: 'Dashboard', url: '/super-admin', iconName: 'LayoutDashboard' },
  { title: 'Organizacoes', url: '/super-admin/organizations', iconName: 'Building' },
  { title: 'Usuarios', url: '/super-admin/users', iconName: 'UserCog' },
  { title: 'Permissoes', url: '/super-admin/permissions', iconName: 'Shield' },
  { title: 'Moedas', url: '/super-admin/currencies', iconName: 'Coins' },
  { title: 'Pools', url: '/super-admin/pools', iconName: 'Database' },
  { title: 'Mineracao', url: '/super-admin/pool-stats', iconName: 'Activity' },
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
  const [user, setUser] = useState<NavUserProps | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Verificar sessão
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          navigate('/login')
          return
        }

        // Buscar dados do usuário
        const { data: userData, error } = await supabase
          .from('v_users_details')
          .select('*')
          .eq('auth_user_id', session.user.id)
          .single()

        if (error) {
          console.error('Erro ao buscar usuário:', error)
          // Se não encontrar dados do usuário, usar dados básicos da sessão
          setUser({
            name: session.user.email?.split('@')[0] || 'Usuário',
            email: session.user.email || '',
            role: 'Usuário',
          })
        } else {
          setUser({
            name: userData.name,
            email: userData.email,
            role: userData.role_name,
            avatar_url: userData.avatar_url,
          })
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} navItems={superAdminNavItems} />
      <SidebarInset>
        <Topbar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
