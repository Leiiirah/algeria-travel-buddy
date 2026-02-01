import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Settings,
  FolderOpen,
  Building2,
  Calculator,
  LogOut,
  Package,
  Wallet,
  Palmtree,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import logoElHikma from '@/assets/logo-elhikma.png';

const mainMenuItems = [
  {
    title: 'Tableau de bord',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Commandes',
    url: '/commandes',
    icon: Package,
  },
  {
    title: 'Omra',
    url: '/omra',
    icon: Palmtree,
  },
  {
    title: 'Documents',
    url: '/documents',
    icon: FolderOpen,
  },
];

const managementMenuItems = [
  {
    title: 'Employés',
    url: '/employes',
    icon: Users,
  },
  {
    title: 'Fournisseurs',
    url: '/fournisseurs',
    icon: Building2,
  },
  {
    title: 'Situation Fournisseurs',
    url: '/situation-fournisseurs',
    icon: Wallet,
  },
  {
    title: 'Comptabilité',
    url: '/comptabilite',
    icon: Calculator,
  },
];

const adminMenuItems = [
  {
    title: 'Services',
    url: '/services',
    icon: Settings,
  },
];

export function AppSidebar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden bg-primary/10">
            <img 
              src={logoElHikma} 
              alt="El Hikma Logo" 
              className="h-10 w-10 object-contain"
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-foreground">
                El Hikma Tourisme
              </span>
              <span className="text-xs text-sidebar-muted">
                Tourisme et Voyage
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3"
                      activeClassName="bg-sidebar-primary/20 text-sidebar-primary"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted">
            Gestion
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3"
                      activeClassName="bg-sidebar-primary/20 text-sidebar-primary"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-muted">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                      tooltip={item.title}
                    >
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3"
                        activeClassName="bg-sidebar-primary/20 text-sidebar-primary"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {user && (
          <div className="flex flex-col gap-3">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-sidebar-foreground">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-xs text-sidebar-muted capitalize">
                    {user.role === 'admin' ? 'Administrateur' : 'Employé'}
                  </span>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size={isCollapsed ? 'icon' : 'sm'}
              onClick={logout}
              className="w-full justify-start gap-2 text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span>Déconnexion</span>}
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
