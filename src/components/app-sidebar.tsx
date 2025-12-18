import { Link } from 'react-router-dom'

import { NavMain, type NavItem } from '@/components/nav-main'
import { NavUser, type NavUserProps } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from '@/components/ui/Sidebar'

const DEFAULT_USER: NavUserProps = {
  name: 'Usuario',
  email: 'usuario@example.com',
}

export function AppSidebar({
  user,
  navItems,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: NavUserProps | null
  navItems: NavItem[]
}) {
  const resolvedUser = user ?? DEFAULT_USER
  const { open } = useSidebar()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Link
          to="/super-admin"
          className="flex items-center justify-center gap-2 py-1.5"
        >
          {open ? (
            <img
              src="/Est3lar-Colors.png"
              alt="Est3lar"
              className="h-auto max-h-10 max-w-[10.5rem]"
            />
          ) : (
            <img
              src="/icon-est3lar-roxo.png"
              alt="Est3lar"
              className="h-8 w-8 flex-shrink-0"
            />
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={resolvedUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
