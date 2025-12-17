import { ChevronsUpDown, LogOut } from 'lucide-react'
import { useTransition, useEffect, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/Sidebar'
import { gradients, shadows, borders } from '@/design-system'

export type NavUserProps = {
  name: string
  email: string
  avatar_url?: string
  role?: string
}

async function logout() {
  // Por enquanto, apenas redireciona para login
  // Quando integrar Supabase, adicionar lógica de logout real
  window.location.href = '/login'
}

export function NavUser({ user }: { user: NavUserProps }) {
  const { isMobile } = useSidebar()

  const displayName = user?.name || user?.email?.split('@')[0] || 'Usuario'
  const displayEmail = user?.email || 'no-email@example.com'
  const initials =
    displayName
      .split(' ')
      .map((part) => part[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'US'

  const displayRole = user?.role

  let displaySecondLine = displayEmail
  if (displayRole) {
    displaySecondLine += ` - ${displayRole}`
  }

  const avatarClassName = user?.avatar_url
    ? 'h-8 w-8 rounded-lg !bg-transparent hover:!bg-transparent'
    : `h-8 w-8 rounded-lg bg-gradient-to-r ${gradients.brand} ${borders.dark} shadow-[${shadows.button}]`

  const [isPending, startTransition] = useTransition()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <Avatar className={avatarClassName}>
              {user?.avatar_url && (
                <AvatarImage src={user.avatar_url} alt={displayName} />
              )}
              <AvatarFallback className="rounded-lg bg-transparent text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{displayName}</span>
              <span className="truncate text-xs text-text-secondary">
                {displaySecondLine}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-surface data-[state=open]:text-text-primary"
            >
              <Avatar className={avatarClassName}>
                {user?.avatar_url && (
                  <AvatarImage src={user.avatar_url} alt={displayName} />
                )}
                <AvatarFallback className="rounded-lg bg-transparent text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs text-text-secondary">
                  {displaySecondLine}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className={avatarClassName}>
                  {user?.avatar_url && (
                    <AvatarImage src={user.avatar_url} alt={displayName} />
                  )}
                  <AvatarFallback className="rounded-lg bg-transparent text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs text-text-secondary">
                    {displaySecondLine}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (!isPending) {
                  startTransition(() => {
                    void logout()
                  })
                }
              }}
              className="cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isPending ? 'Saindo...' : 'Sair'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
