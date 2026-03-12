import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { MoreHorizontal, Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { RouteErrorBoundary } from '@/components/errors/RouteErrorBoundary'
import { TablePagination } from '@/components/TablePagination'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DEFAULT_PAGE_SIZE } from '@/config/constants'
import {
  type Role,
  rolesQueryOptions,
  rolePermissionsQueryOptions,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useSetRolePermissions,
} from '@/features/auth'
import { useTranslation } from '@/lib/i18n'
import { useAuthStore } from '@/stores/auth.store'
import { ApiException } from '@/types/api.types'
import { PERMISSIONS, PERMISSION_GROUPS } from '@/types/permissions'
import { requirePermission } from './-route-guards'

export const Route = createFileRoute('/admin/_authenticated/roles')({
  beforeLoad: () => {
    requirePermission(PERMISSIONS.ROLE_READ)
  },
  validateSearch: (search: Record<string, unknown>) => ({
    page: typeof search.page === 'number' && search.page >= 1 ? Math.floor(search.page) : undefined,
    pageSize:
      typeof search.pageSize === 'number' && search.pageSize >= 1
        ? Math.floor(search.pageSize)
        : undefined,
  }),
  errorComponent: (props) => <RouteErrorBoundary {...props} backTo="/admin" />,
  component: RolesPage,
})

const roleSchema = z.object({
  name: z
    .string()
    .min(3, 'Role name must be at least 3 characters')
    .max(50, 'Role name must be at most 50 characters'),
})

function RolesPage() {
  const { t } = useTranslation()
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const { page, pageSize } = Route.useSearch()
  const routeNavigate = Route.useNavigate()
  const currentPage = page ?? 1
  const currentPageSize = pageSize ?? DEFAULT_PAGE_SIZE

  const { data: rolesResponse, isFetching } = useQuery({
    ...rolesQueryOptions({
      page_number: currentPage,
      page_size: currentPageSize,
    }),
    placeholderData: keepPreviousData,
  })
  const roles = rolesResponse?.content ?? []
  const canManage = hasPermission(PERMISSIONS.ROLE_MANAGE)

  const [createOpen, setCreateOpen] = useState(false)
  const [editRole, setEditRole] = useState<Role | null>(null)
  const [deleteRole, setDeleteRole] = useState<Role | null>(null)
  const [permsRole, setPermsRole] = useState<Role | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          {t('auth.roles.title')}
        </h1>
        {canManage && (
          <Button
            size="sm"
            onClick={() => {
              setCreateOpen(true)
            }}
          >
            <Plus className="mr-2 size-4" />
            {t('auth.roles.createRole')}
          </Button>
        )}
      </div>

      {roles.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">{t('auth.roles.noRoles')}</p>
      ) : (
        <div
          className={`overflow-x-auto rounded-md border transition-opacity ${isFetching ? 'opacity-50' : ''}`}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('auth.roles.roleName')}</TableHead>
                <TableHead>{t('common.labels.createdAt')}</TableHead>
                <TableHead>{t('common.labels.updatedAt')}</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(role.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(role.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canManage && (
                          <DropdownMenuItem
                            onClick={() => {
                              setEditRole(role)
                            }}
                          >
                            {t('auth.roles.editRole')}
                          </DropdownMenuItem>
                        )}
                        {canManage && (
                          <DropdownMenuItem
                            onClick={() => {
                              setPermsRole(role)
                            }}
                          >
                            {t('auth.roles.managePermissions')}
                          </DropdownMenuItem>
                        )}
                        {canManage && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setDeleteRole(role)
                              }}
                            >
                              {t('auth.roles.deleteRole')}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <TablePagination
        page={currentPage}
        pageSize={currentPageSize}
        totalCount={rolesResponse?.count}
        onPageChange={(newPage) => {
          void routeNavigate({
            search: (prev) => ({ ...prev, page: newPage === 1 ? undefined : newPage }),
          })
        }}
        onPageSizeChange={(newSize) => {
          void routeNavigate({
            search: (prev) => ({
              ...prev,
              pageSize: newSize === DEFAULT_PAGE_SIZE ? undefined : newSize,
              page: undefined,
            }),
          })
        }}
      />

      <CreateRoleDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditRoleDialog
        role={editRole}
        onClose={() => {
          setEditRole(null)
        }}
      />
      <DeleteRoleDialog
        role={deleteRole}
        onClose={() => {
          setDeleteRole(null)
        }}
      />
      <ManageRolePermissionsDialog
        role={permsRole}
        onClose={() => {
          setPermsRole(null)
        }}
      />
    </div>
  )
}

// --- Create Role Dialog ---

function CreateRoleDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const createRole = useCreateRole()
  const form = useForm<z.infer<typeof roleSchema>>({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: '' },
  })

  async function onSubmit(values: z.infer<typeof roleSchema>) {
    try {
      await createRole.mutateAsync(values)
      toast.success(t('auth.roles.created'))
      form.reset()
      onOpenChange(false)
    } catch (error) {
      if (error instanceof ApiException) {
        if (error.isNetworkError) {
          toast.error(t('common.errors.networkError'))
          return
        }
        if (error.fields !== undefined) {
          for (const field of Object.keys(error.fields)) {
            if (field === 'name') {
              form.setError(field, { type: 'server' })
            }
          }
        }
        form.setError('root', { message: error.message })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('auth.roles.createRole')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              void form.handleSubmit(onSubmit)(e)
            }}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.roles.roleName')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={createRole.isPending}>
                {t('common.actions.create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// --- Edit Role Dialog ---

function EditRoleDialog({ role, onClose }: { role: Role | null; onClose: () => void }) {
  const { t } = useTranslation()
  const updateRole = useUpdateRole()
  const form = useForm<z.infer<typeof roleSchema>>({
    resolver: zodResolver(roleSchema),
    values: { name: role?.name ?? '' },
  })

  async function onSubmit(values: z.infer<typeof roleSchema>) {
    if (!role) {
      return
    }
    try {
      await updateRole.mutateAsync({ id: role.id, name: values.name })
      toast.success(t('auth.roles.updated'))
      onClose()
    } catch (error) {
      if (error instanceof ApiException) {
        if (error.isNetworkError) {
          toast.error(t('common.errors.networkError'))
          return
        }
        if (error.fields !== undefined) {
          for (const field of Object.keys(error.fields)) {
            if (field === 'name') {
              form.setError(field, { type: 'server' })
            }
          }
        }
        form.setError('root', { message: error.message })
      }
    }
  }

  return (
    <Dialog
      open={role !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('auth.roles.editRole')}</DialogTitle>
          <DialogDescription>{role?.name}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              void form.handleSubmit(onSubmit)(e)
            }}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.roles.roleName')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={updateRole.isPending}>
                {t('common.actions.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// --- Delete Role Dialog ---

function DeleteRoleDialog({ role, onClose }: { role: Role | null; onClose: () => void }) {
  const { t } = useTranslation()
  const deleteRoleMutation = useDeleteRole()
  const [error, setError] = useState<string | null>(null)

  function onConfirm() {
    if (!role) {
      return
    }
    setError(null)
    deleteRoleMutation.mutate(role.id, {
      onSuccess: () => {
        toast.success(t('auth.roles.deleted'))
        onClose()
      },
      onError: (err: unknown) => {
        if (err instanceof ApiException && err.code === 'ROLE_HAS_ASSIGNED_USERS') {
          setError(t('auth.roles.roleHasUsers'))
        }
      },
    })
  }

  return (
    <AlertDialog
      open={role !== null}
      onOpenChange={(open) => {
        if (!open) {
          setError(null)
          onClose()
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('common.confirm.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('auth.roles.deleteConfirm')}
            {error !== null && <span className="text-destructive mt-2 block text-sm">{error}</span>}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={deleteRoleMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t('common.actions.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// --- Manage Role Permissions Dialog ---

function ManageRolePermissionsDialog({
  role,
  onClose,
}: {
  role: Role | null
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { data: rolePerms } = useQuery({
    ...rolePermissionsQueryOptions(role?.id ?? 0),
    enabled: role !== null,
  })
  const setRolePermissions = useSetRolePermissions()
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    setSelected(rolePerms?.map((p) => p.permission) ?? [])
  }, [rolePerms])

  function toggle(permission: string) {
    setSelected((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission],
    )
  }

  function onSave() {
    if (!role) {
      return
    }
    setRolePermissions.mutate(
      { role_id: role.id, permissions: selected },
      {
        onSuccess: () => {
          toast.success(t('auth.roles.permissionsUpdated'))
          onClose()
        },
      },
    )
  }

  return (
    <Dialog
      open={role !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('auth.roles.managePermissions')}</DialogTitle>
          <DialogDescription>{role?.name}</DialogDescription>
        </DialogHeader>
        <div className="max-h-32rem overflow-y-auto">
          <div className="space-y-4 p-1">
            {Object.entries(PERMISSION_GROUPS).map(([group, permissions]) => (
              <div key={group}>
                <h4 className="mb-2 text-sm font-medium capitalize">{group}</h4>
                <div className="space-y-1.5 pl-2">
                  {permissions.map((perm) => (
                    <label key={perm} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={selected.includes(perm)}
                        onCheckedChange={() => {
                          toggle(perm)
                        }}
                      />
                      <code className="text-xs">{perm}</code>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSave} disabled={setRolePermissions.isPending}>
            {t('common.actions.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
