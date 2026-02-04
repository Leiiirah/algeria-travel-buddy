import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  Users2,
  Receipt,
  ClipboardCheck,
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

export function AppSidebar() {
  const { t, i18n } = useTranslation();
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const isRtl = i18n.language === 'ar';

  const mainMenuItems = [
    {
      titleKey: 'navigation.dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      titleKey: 'navigation.commands',
      url: '/commandes',
      icon: Package,
    },
    {
      titleKey: 'navigation.omra',
      url: '/omra',
      icon: Palmtree,
    },
    {
      titleKey: 'navigation.internalTasks',
      url: '/missions-internes',
      icon: ClipboardCheck,
    },
    {
      titleKey: 'navigation.documents',
      url: '/documents',
      icon: FolderOpen,
    },
  ];

  // Items visible to all users
  const employeeMenuItems = [
    {
      titleKey: 'navigation.employeeAccounting',
      url: '/comptabilite-employes',
      icon: Users2,
    },
  ];

  // Admin-only management items
  const managementMenuItems = [
    {
      titleKey: 'navigation.employees',
      url: '/employes',
      icon: Users,
    },
    {
      titleKey: 'navigation.suppliers',
      url: '/fournisseurs',
      icon: Building2,
    },
    {
      titleKey: 'navigation.supplierAccounting',
      url: '/situation-fournisseurs',
      icon: Wallet,
    },
    {
      titleKey: 'navigation.employeeAccounting',
      url: '/comptabilite-employes',
      icon: Users2,
    },
    {
      titleKey: 'navigation.accounting',
      url: '/comptabilite',
      icon: Calculator,
    },
  ];

  const adminMenuItems = [
    {
      titleKey: 'navigation.services',
      url: '/services',
      icon: Settings,
    },
    {
      titleKey: 'navigation.serviceTypes',
      url: '/types-services',
      icon: Package,
    },
    {
      titleKey: 'navigation.expenses',
      url: '/depenses',
      icon: Receipt,
    },
  ];

  return (
    <Sidebar collapsible="icon" side={isRtl ? 'right' : 'left'} className="border-sidebar-border ltr:border-r rtl:border-l">
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
                {t('company.name')}
              </span>
              <span className="text-xs text-sidebar-muted">
                {t('company.subtitle')}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted">
            {t('groups.main')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={t(item.titleKey)}
                  >
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3"
                      activeClassName="bg-sidebar-primary/20 text-sidebar-primary"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{t(item.titleKey)}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Personal section for employees */}
        {!isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-muted">
              {t('groups.personal')}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {employeeMenuItems.map((item) => (
                  <SidebarMenuItem key={item.titleKey}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                      tooltip={t(item.titleKey)}
                    >
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3"
                        activeClassName="bg-sidebar-primary/20 text-sidebar-primary"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{t(item.titleKey)}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Admin-only management section */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-muted">
              {t('groups.management')}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {managementMenuItems.map((item) => (
                  <SidebarMenuItem key={item.titleKey}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                      tooltip={t(item.titleKey)}
                    >
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3"
                        activeClassName="bg-sidebar-primary/20 text-sidebar-primary"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{t(item.titleKey)}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-muted">
              {t('groups.administration')}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.titleKey}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                      tooltip={t(item.titleKey)}
                    >
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3"
                        activeClassName="bg-sidebar-primary/20 text-sidebar-primary"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{t(item.titleKey)}</span>
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
                    {t(`roles.${user.role}`)}
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
              {!isCollapsed && <span>{t('user.logout')}</span>}
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
