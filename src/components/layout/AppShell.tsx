import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from '@/lib/i18n'
import { useSidebarStore } from '@/stores/sidebar.store'
import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'

export function AppShell({ children }: { children: React.ReactNode }) {
  const open = useSidebarStore((s) => s.open)
  const setOpen = useSidebarStore((s) => s.setOpen)

  return (
    <SidebarProvider open={open} onOpenChange={setOpen} data-admin="">
      {/* Ambient background layer */}
      <div className="admin-ambient-bg fixed inset-0 -z-10" aria-hidden="true">
        <div
          className="fixed right-1/4 bottom-1/3 h-[350px] w-[350px] rounded-full opacity-60 blur-[80px]"
          style={{ background: 'var(--admin-bg-blob-3)' }}
        />
      </div>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="relative z-10 flex flex-1 flex-col p-4 md:p-6">
          <div className="mx-auto w-full max-w-screen-2xl">
            <Suspense fallback={<RouteContentFallback />}>{children}</Suspense>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

function RouteContentFallback() {
  const { t } = useTranslation()

  return (
    <div className="animate-in fade-in-0 flex flex-col gap-6 duration-200">
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Loader2 className="size-4 animate-spin" />
        <span>{t('common.labels.loading')}</span>
      </div>
      <Skeleton className="h-10 w-72 max-w-full" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
      <Skeleton className="h-[320px] w-full" />
    </div>
  )
}
