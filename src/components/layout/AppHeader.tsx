import { Fragment } from 'react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { CircleUser, LogOut, User } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useLogout } from '@/features/auth'
import { useTranslation } from '@/lib/i18n'
import { useAuthStore } from '@/stores/auth.store'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeSwitcher } from './ThemeSwitcher'

const ROUTE_LABELS: Record<string, string> = {
  '/admin': 'nav.dashboard',
  '/admin/users': 'nav.users',
  '/admin/roles': 'nav.roles',
  '/admin/sessions': 'nav.sessions',
  '/admin/audit/action-logs': 'nav.actionLogs',
  '/admin/audit/status-changes': 'nav.statusChanges',
  '/admin/platform/queues': 'nav.queues',
  '/admin/platform/dlq': 'nav.dlq',
  '/admin/platform/task-results': 'nav.taskResults',
  '/admin/platform/schedules': 'nav.schedules',
  '/admin/platform/errors': 'nav.errors',
  '/admin/profile': 'nav.profile',
}

export function AppHeader() {
  const { t } = useTranslation()
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  const breadcrumbs = buildBreadcrumbs(pathname, t)

  return (
    <header className="glass-header flex h-14 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1
            return (
              <Fragment key={crumb.path}>
                {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                <BreadcrumbItem className={index === 0 ? '' : 'hidden md:block'}>
                  {isLast ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={crumb.path}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex-1" />
      <LanguageSwitcher />
      <ThemeSwitcher />
      <ProfileDropdown />
    </header>
  )
}

interface BreadcrumbEntry {
  path: string
  label: string
}

function buildBreadcrumbs(pathname: string, t: (key: string) => string): BreadcrumbEntry[] {
  const crumbs: BreadcrumbEntry[] = [{ path: '/admin', label: t('nav.dashboard') }]

  if (pathname === '/admin' || pathname === '/admin/') {
    return crumbs
  }

  const labelKey = ROUTE_LABELS[pathname]
  if (labelKey !== undefined) {
    crumbs.push({ path: pathname, label: t(labelKey) })
    return crumbs
  }

  // Handle dynamic routes like /admin/platform/errors/:id
  if (pathname.startsWith('/admin/platform/errors/')) {
    crumbs.push({ path: '/admin/platform/errors', label: t('nav.errors') })
    crumbs.push({ path: pathname, label: t('platform.errorDetail.title') })
    return crumbs
  }

  return crumbs
}

function ProfileDropdown() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const username = useAuthStore((s) => s.username)
  const logoutMutation = useLogout()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <CircleUser className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-sm font-medium">{username}</div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            void navigate({ to: '/admin/profile' })
          }}
        >
          <User className="mr-2 size-4" />
          {t('nav.profile')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            void logoutMutation.mutateAsync().then(() => {
              void navigate({ to: '/admin/login' })
            })
          }}
        >
          <LogOut className="mr-2 size-4" />
          {t('common.actions.logOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
