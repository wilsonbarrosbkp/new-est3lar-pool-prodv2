import { useEffect,useState, useTransition } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity,
  BarChart3,
  Building,
  Coins,
  CreditCard,
  Database,
  FileText,
  Globe,
  LayoutDashboard,
  Loader2,
  type LucideIcon,
  RotateCcw,
  Shield,
  TrendingUp,
  UserCog,
  Users,
  Wallet,
  Webhook,
} from 'lucide-react'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/Sidebar'
import { borders,gradients, shadows } from '@/design-system'

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  RotateCcw,
  CreditCard,
  Webhook,
  Wallet,
  Globe,
  Shield,
  BarChart3,
  Building,
  UserCog,
  Coins,
  Database,
  TrendingUp,
  FileText,
  Activity,
}

export type NavItem = {
  title: string
  url: string
  iconName?: string
  disabled?: boolean
}

export function NavMain({ items }: { items: NavItem[] }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isPending, startTransition] = useTransition()
  const [clickedUrl, setClickedUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!isPending && clickedUrl) {
      setClickedUrl(null)
    }
  }, [isPending, clickedUrl])

  const handleNavigation = (e: React.MouseEvent, url: string) => {
    if (e.ctrlKey || e.metaKey || e.button === 1) {
      return
    }

    if (location.pathname === url) {
      return
    }

    e.preventDefault()
    setClickedUrl(url)

    startTransition(() => {
      navigate(url)
    })
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navegacao</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const active = location.pathname === item.url
          const IconComponent = item.iconName ? iconMap[item.iconName] : null
          const isLoading = isPending && clickedUrl === item.url
          const isCurrentlyDisabled = item.disabled || isLoading

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild={!isCurrentlyDisabled}
                tooltip={
                  active
                    ? {
                        children: item.title,
                        className:
                          `bg-gradient-to-r ${gradients.brand} text-white ${borders.dark} shadow-[${shadows.button}] [&>*:last-child]:hidden`,
                      }
                    : item.title
                }
                isActive={active}
                disabled={isCurrentlyDisabled}
                className={isLoading ? 'opacity-60 cursor-wait' : ''}
              >
                {isCurrentlyDisabled ? (
                  <div className="flex items-center gap-2 w-full">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                    ) : (
                      IconComponent && <IconComponent className="h-4 w-4" />
                    )}
                    <span>{item.title}</span>
                  </div>
                ) : (
                  <Link
                    to={item.url}
                    onClick={(e) => handleNavigation(e, item.url)}
                  >
                    {IconComponent && <IconComponent className="h-4 w-4" />}
                    <span>{item.title}</span>
                  </Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
