import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import {
  Activity,
  AlertTriangle,
  Calendar,
  Film,
  Inbox,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Monitor,
  ScrollText,
  Shield,
  Users,
} from 'lucide-react'
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
  SidebarRail,
} from '@/components/ui/sidebar'
import { useLogout } from '@/features/auth'
import { useTranslation } from '@/lib/i18n'
import { useAuthStore } from '@/stores/auth.store'
import { PERMISSIONS } from '@/types/permissions'
import type { Permission } from '@/types/permissions'

interface NavItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  permission?: Permission
}

interface NavGroup {
  label: string
  items: NavItem[]
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()
  const logoutMutation = useLogout()
  const navigate = useNavigate()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  const hasPermission = useAuthStore((s) => s.hasPermission)

  const navGroups: NavGroup[] = [
    {
      label: t('nav.dashboard'),
      items: [
        {
          title: t('nav.dashboard'),
          url: '/admin',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: t('nav.groups.catalog'),
      items: [
        {
          title: t('nav.movies'),
          url: '/admin/catalog/movies',
          icon: Film,
          permission: PERMISSIONS.CATALOG_MOVIE_READ,
        },
      ],
    },
    {
      label: t('nav.groups.auth'),
      items: [
        {
          title: t('nav.users'),
          url: '/admin/users',
          icon: Users,
          permission: PERMISSIONS.USER_READ,
        },
        {
          title: t('nav.roles'),
          url: '/admin/roles',
          icon: Shield,
          permission: PERMISSIONS.ROLE_READ,
        },
        {
          title: t('nav.sessions'),
          url: '/admin/sessions',
          icon: Monitor,
          permission: PERMISSIONS.SESSION_READ,
        },
      ],
    },
    {
      label: t('nav.groups.audit'),
      items: [
        {
          title: t('nav.actionLogs'),
          url: '/admin/audit/action-logs',
          icon: ScrollText,
          permission: PERMISSIONS.ACTION_LOG_READ,
        },
        {
          title: t('nav.statusChanges'),
          url: '/admin/audit/status-changes',
          icon: Activity,
          permission: PERMISSIONS.STATUS_CHANGE_LOG_READ,
        },
      ],
    },
    {
      label: t('nav.groups.platform'),
      items: [
        {
          title: t('nav.queues'),
          url: '/admin/platform/queues',
          icon: Inbox,
          permission: PERMISSIONS.TASKMILL_VIEW,
        },
        {
          title: t('nav.dlq'),
          url: '/admin/platform/dlq',
          icon: AlertTriangle,
          permission: PERMISSIONS.TASKMILL_VIEW,
        },
        {
          title: t('nav.taskResults'),
          url: '/admin/platform/task-results',
          icon: ListChecks,
          permission: PERMISSIONS.TASKMILL_VIEW,
        },
        {
          title: t('nav.schedules'),
          url: '/admin/platform/schedules',
          icon: Calendar,
          permission: PERMISSIONS.TASKMILL_VIEW,
        },
        {
          title: t('nav.errors'),
          url: '/admin/platform/errors',
          icon: AlertTriangle,
          permission: PERMISSIONS.ALERT_VIEW,
        },
      ],
    },
  ]

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => item.permission === undefined || hasPermission(item.permission),
      ),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/admin">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <LayoutDashboard className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{t('common.labels.appName')}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {visibleGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        item.url === '/admin'
                          ? currentPath === '/admin' || currentPath === '/admin/'
                          : currentPath.startsWith(item.url)
                      }
                      tooltip={item.title}
                    >
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={t('common.actions.logOut')}
              onClick={() => {
                void logoutMutation.mutateAsync().then(() => {
                  void navigate({ to: '/admin/login' })
                })
              }}
            >
              <LogOut />
              <span>{t('common.actions.logOut')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
