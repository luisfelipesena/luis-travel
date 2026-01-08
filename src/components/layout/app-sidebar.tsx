import { Link } from "@tanstack/react-router"
import { Calendar, Home, Plane, PlaneTakeoff, Users } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"

const navItems = [
  { title: "Início", icon: Home, href: "/dashboard" },
  { title: "Minhas Viagens", icon: Plane, href: "/dashboard/trips" },
  { title: "Calendário", icon: Calendar, href: "/dashboard/calendar" },
  { title: "Voos", icon: PlaneTakeoff, href: "/dashboard/flights" },
  { title: "Convites", icon: Users, href: "/dashboard/invitations" },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string
    email: string
    image?: string
  }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <img src="/luis-travel-icon.svg" alt="Luis Travel" className="size-8" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-[#2D8B6F]">Luis Travel</span>
                  <span className="truncate text-xs text-muted-foreground">Planeje sua viagem</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
