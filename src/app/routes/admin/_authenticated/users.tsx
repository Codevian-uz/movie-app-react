import { memo, useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { MoreHorizontal, Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { RouteErrorBoundary } from '@/components/errors/RouteErrorBoundary'
import { TablePagination } from '@/components/TablePagination'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { Badge } from '@/components/ui/badge'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  type User,
  useCreateUser,
  useDisableUser,
  useEnableUser,
  useUpdateUser,
  usersQueryOptions,
  rolesQueryOptions,
  userRolesQueryOptions,
  userPermissionsQueryOptions,
  useSetUserRoles,
  useSetUserPermissions,
} from '@/features/auth'
import { useTranslation } from '@/lib/i18n'
import { formatRelativeTime } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { ApiException } from '@/types/api.types'
import { PERMISSIONS, PERMISSION_GROUPS } from '@/types/permissions'
import { requirePermission } from './-route-guards'

export const Route = createFileRoute('/admin/_authenticated/users')({
  beforeLoad: () => {
    requirePermission(PERMISSIONS.USER_READ)
  },
  validateSearch: (search: Record<string, unknown>) => ({
    username: typeof search.username === 'string' ? search.username : undefined,
    status:
      search.status === 'all' || search.status === 'active' || search.status === 'disabled'
        ? search.status
        : undefined,
    page: typeof search.page === 'number' && search.page >= 1 ? Math.floor(search.page) : undefined,
    pageSize:
      typeof search.pageSize === 'number' && search.pageSize >= 1
        ? Math.floor(search.pageSize)
        : undefined,
  }),
  errorComponent: (props) => <RouteErrorBoundary {...props} backTo="/admin" />,
  component: UsersPage,
})

// --- Schemas ---

const createUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const editUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters'),
  password: z.string().refine((v) => v === '' || v.length >= 8, {
    message: 'Password must be at least 8 characters',
  }),
})

// --- Page ---

function UsersPage() {
  const { t } = useTranslation()
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const { username, status, page, pageSize } = Route.useSearch()
  const routeNavigate = Route.useNavigate()
  const [search, setSearch] = useState(username ?? '')
  const [committedSearch, setCommittedSearch] = useState(username ?? '')
  const statusFilter = status ?? 'all'
  const currentPage = page ?? 1
  const currentPageSize = pageSize ?? DEFAULT_PAGE_SIZE

  const {
    data: usersResponse,
    isFetching,
    refetch,
  } = useQuery({
    ...usersQueryOptions({
      username: committedSearch || undefined,
      is_active: statusFilter === 'all' ? undefined : statusFilter === 'active',
      page_number: currentPage,
      page_size: currentPageSize,
    }),
    placeholderData: keepPreviousData,
  })

  function handleSearch() {
    if (search === committedSearch) {
      void refetch()
    } else {
      setCommittedSearch(search)
      void routeNavigate({
        search: (prev) => ({
          ...prev,
          username: search || undefined,
          page: undefined,
        }),
      })
    }
  }

  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [toggleUser, setToggleUser] = useState<User | null>(null)
  const [rolesUser, setRolesUser] = useState<User | null>(null)
  const [permsUser, setPermsUser] = useState<User | null>(null)

  const canManage = hasPermission(PERMISSIONS.USER_MANAGE)
  const canManageAccess = hasPermission(PERMISSIONS.ACCESS_MANAGE)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          {t('auth.users.title')}
        </h1>
        {canManage && (
          <Button
            size="sm"
            onClick={() => {
              setCreateOpen(true)
            }}
          >
            <Plus className="mr-2 size-4" />
            {t('auth.users.createUser')}
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder={t('auth.users.username')}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch()
            }
          }}
          className="max-w-sm"
          data-testid="users-search"
        />
        <Button variant="outline" size="sm" onClick={handleSearch}>
          {t('common.actions.search')}
        </Button>
        <Select
          value={statusFilter}
          onValueChange={(nextStatus) => {
            void routeNavigate({
              search: (prev) => ({
                ...prev,
                status: nextStatus === 'all' ? undefined : nextStatus,
                page: undefined,
              }),
            })
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.labels.all')}</SelectItem>
            <SelectItem value="active">{t('common.labels.active')}</SelectItem>
            <SelectItem value="disabled">{t('common.labels.disabled')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <UsersTableSection
        users={usersResponse?.content ?? []}
        totalCount={usersResponse?.count}
        isFetching={isFetching}
        page={currentPage}
        pageSize={currentPageSize}
        onEditUser={setEditUser}
        onToggleUser={setToggleUser}
        onRolesUser={setRolesUser}
        onPermsUser={setPermsUser}
      />

      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditUserDialog
        user={editUser}
        onClose={() => {
          setEditUser(null)
        }}
      />
      <ToggleUserDialog
        user={toggleUser}
        onClose={() => {
          setToggleUser(null)
        }}
      />
      <ManageRolesDialog
        user={rolesUser}
        readOnly={!canManageAccess}
        onClose={() => {
          setRolesUser(null)
        }}
      />
      <ManagePermissionsDialog
        user={permsUser}
        readOnly={!canManageAccess}
        onClose={() => {
          setPermsUser(null)
        }}
      />
    </div>
  )
}

// --- Users Table Section (memoized to prevent re-renders during filter typing) ---

interface UsersTableSectionProps {
  users: User[]
  totalCount: number | undefined
  isFetching: boolean
  page: number
  pageSize: number
  onEditUser: (user: User) => void
  onToggleUser: (user: User) => void
  onRolesUser: (user: User) => void
  onPermsUser: (user: User) => void
}

const UsersTableSection = memo(function UsersTableSection({
  users,
  totalCount,
  isFetching,
  page,
  pageSize,
  onEditUser,
  onToggleUser,
  onRolesUser,
  onPermsUser,
}: UsersTableSectionProps) {
  const { t } = useTranslation()
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const routeNavigate = Route.useNavigate()
  const navigate = useNavigate()

  const canManage = hasPermission(PERMISSIONS.USER_MANAGE)
  const canManageAccess = hasPermission(PERMISSIONS.ACCESS_MANAGE)
  const canReadAccess = hasPermission(PERMISSIONS.ACCESS_READ)
  const canReadSessions = hasPermission(PERMISSIONS.SESSION_READ)

  return (
    <>
      {users.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">{t('auth.users.noUsers')}</p>
      ) : (
        <div
          className={`overflow-x-auto rounded-md border transition-opacity ${isFetching ? 'opacity-50' : ''}`}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.labels.id')}</TableHead>
                <TableHead>{t('auth.users.username')}</TableHead>
                <TableHead>{t('auth.users.status')}</TableHead>
                <TableHead>{t('auth.users.roles')}</TableHead>
                <TableHead>{t('auth.users.directPermissions')}</TableHead>
                <TableHead>{t('auth.users.lastActive')}</TableHead>
                <TableHead>{t('common.labels.createdAt')}</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-xs">{user.id}</TableCell>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'default' : 'secondary'}>
                      {user.is_active ? t('common.labels.active') : t('common.labels.disabled')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.roles.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <Badge key={role} variant="outline">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.direct_permissions.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.direct_permissions.map((perm) => (
                          <Badge key={perm} variant="secondary" className="font-mono text-xs">
                            {perm}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatRelativeTime(user.last_active_at)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
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
                              onEditUser(user)
                            }}
                          >
                            {t('auth.users.editUser')}
                          </DropdownMenuItem>
                        )}
                        {canManage && (
                          <DropdownMenuItem
                            onClick={() => {
                              onToggleUser(user)
                            }}
                          >
                            {user.is_active
                              ? t('auth.users.disableUser')
                              : t('auth.users.enableUser')}
                          </DropdownMenuItem>
                        )}
                        {(canManageAccess || canReadAccess) && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                onRolesUser(user)
                              }}
                            >
                              {canManageAccess
                                ? t('auth.users.manageRoles')
                                : t('auth.users.viewRoles')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                onPermsUser(user)
                              }}
                            >
                              {canManageAccess
                                ? t('auth.users.managePermissions')
                                : t('auth.users.viewPermissions')}
                            </DropdownMenuItem>
                          </>
                        )}
                        {canReadSessions && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                void navigate({
                                  to: '/admin/sessions',
                                  search: { userId: user.id },
                                })
                              }}
                            >
                              {t('auth.users.viewSessions')}
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
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
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
    </>
  )
})

// --- Create User Dialog ---

function CreateUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const createUser = useCreateUser()
  const form = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { username: '', password: '' },
  })

  const traceIdRef = useRef('')

  async function onSubmit(values: z.infer<typeof createUserSchema>) {
    traceIdRef.current = ''
    try {
      await createUser.mutateAsync(values)
      toast.success(t('auth.users.created'))
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
            if (field === 'username' || field === 'password') {
              form.setError(field, { type: 'server' })
            }
          }
        }
        traceIdRef.current = error.traceId
        form.setError('root', { message: error.message })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('auth.users.createUser')}</DialogTitle>
          <DialogDescription>{t('auth.users.title')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              void form.handleSubmit(onSubmit)(e)
            }}
            className="space-y-4"
          >
            {form.formState.errors.root?.message !== undefined && (
              <Alert variant="destructive">
                <AlertDescription>
                  {form.formState.errors.root.message}
                  {traceIdRef.current !== '' && (
                    <span className="mt-1 block font-mono text-xs opacity-60">
                      Trace: {traceIdRef.current}
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.users.username')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.users.password')}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={createUser.isPending}>
                {t('common.actions.create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// --- Edit User Dialog ---

function EditUserDialog({ user, onClose }: { user: User | null; onClose: () => void }) {
  const { t } = useTranslation()
  const updateUser = useUpdateUser()
  const form = useForm<z.infer<typeof editUserSchema>>({
    resolver: zodResolver(editUserSchema),
    values: { username: user?.username ?? '', password: '' },
  })

  async function onSubmit(values: z.infer<typeof editUserSchema>) {
    if (!user) {
      return
    }
    try {
      await updateUser.mutateAsync({
        id: user.id,
        username: values.username,
        password: values.password !== '' ? values.password : undefined,
      })
      toast.success(t('auth.users.updated'))
      onClose()
    } catch (error) {
      if (error instanceof ApiException) {
        if (error.isNetworkError) {
          toast.error(t('common.errors.networkError'))
          return
        }
        if (error.fields !== undefined) {
          for (const field of Object.keys(error.fields)) {
            if (field === 'username' || field === 'password') {
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
      open={user !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('auth.users.editUser')}</DialogTitle>
          <DialogDescription>{user?.username}</DialogDescription>
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
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.users.username')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.users.newPassword')}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('auth.users.keepCurrentPassword')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={updateUser.isPending}>
                {t('common.actions.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// --- Toggle User Status Dialog ---

function ToggleUserDialog({ user, onClose }: { user: User | null; onClose: () => void }) {
  const { t } = useTranslation()
  const disableUser = useDisableUser()
  const enableUser = useEnableUser()

  function onConfirm() {
    if (!user) {
      return
    }
    const mutation = user.is_active ? disableUser : enableUser
    mutation.mutate(user.id, {
      onSuccess: () => {
        toast.success(t('auth.users.statusChanged'))
        onClose()
      },
    })
  }

  const isPending = disableUser.isPending || enableUser.isPending

  return (
    <AlertDialog
      open={user !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('common.confirm.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {user?.is_active === true
              ? t('auth.users.disableConfirm')
              : t('auth.users.enableConfirm')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isPending}>
            {t('common.actions.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// --- Manage Roles Dialog ---

function ManageRolesDialog({
  user,
  readOnly,
  onClose,
}: {
  user: User | null
  readOnly: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { data: rolesResponse } = useQuery(rolesQueryOptions())
  const allRoles = rolesResponse?.content ?? []
  const { data: userRoles } = useQuery({
    ...userRolesQueryOptions(user?.id ?? ''),
    enabled: user !== null,
  })
  const setUserRoles = useSetUserRoles()
  const [selected, setSelected] = useState<number[]>([])

  useEffect(() => {
    setSelected(userRoles?.map((r) => r.id) ?? [])
  }, [userRoles])

  function toggle(roleId: number) {
    setSelected((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId],
    )
  }

  function onSave() {
    if (readOnly || !user) {
      return
    }
    setUserRoles.mutate(
      { user_id: user.id, role_ids: selected },
      {
        onSuccess: () => {
          toast.success(t('auth.permissions.rolesUpdated'))
          onClose()
        },
      },
    )
  }

  return (
    <Dialog
      open={user !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('auth.users.manageRoles')}</DialogTitle>
          <DialogDescription>{user?.username}</DialogDescription>
        </DialogHeader>
        <div className="max-h-64 overflow-y-auto">
          <div className="space-y-2 p-1">
            {allRoles.map((role) => (
              <label key={role.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={selected.includes(role.id)}
                  disabled={readOnly}
                  onCheckedChange={() => {
                    toggle(role.id)
                  }}
                />
                {role.name}
              </label>
            ))}
          </div>
        </div>
        {!readOnly && (
          <DialogFooter>
            <Button onClick={onSave} disabled={setUserRoles.isPending}>
              {t('common.actions.save')}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

// --- Manage Permissions Dialog ---

function ManagePermissionsDialog({
  user,
  readOnly,
  onClose,
}: {
  user: User | null
  readOnly: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { data: userPerms } = useQuery({
    ...userPermissionsQueryOptions(user?.id ?? ''),
    enabled: user !== null,
  })
  const setUserPermissions = useSetUserPermissions()
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    setSelected(userPerms?.map((p) => p.permission) ?? [])
  }, [userPerms])

  function toggle(permission: string) {
    setSelected((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission],
    )
  }

  function onSave() {
    if (readOnly || !user) {
      return
    }
    setUserPermissions.mutate(
      { user_id: user.id, permissions: selected },
      {
        onSuccess: () => {
          toast.success(t('auth.permissions.updated'))
          onClose()
        },
      },
    )
  }

  return (
    <Dialog
      open={user !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('auth.users.managePermissions')}</DialogTitle>
          <DialogDescription>{user?.username}</DialogDescription>
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
                        disabled={readOnly}
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
        {!readOnly && (
          <DialogFooter>
            <Button onClick={onSave} disabled={setUserPermissions.isPending}>
              {t('common.actions.save')}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
