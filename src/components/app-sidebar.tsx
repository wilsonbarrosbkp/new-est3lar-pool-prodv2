import { Link } from 'react-router-dom'

import { type NavItem,NavMain } from '@/components/nav-main'
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
          <img
            src="/genesis-logo.png"
            alt="Genesis Pool"
            className={open ? "h-auto max-h-8 max-w-[9rem]" : "h-6 w-auto max-w-[2.5rem] object-contain"}
          />
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
