import { Edit, MoreHorizontal, Trash2, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTranslation } from '@/lib/i18n'
import type { Studio } from '../../types/catalog.types'

interface StudiosTableProps {
  studios: Studio[]
  onEdit: (studio: Studio) => void
  onDelete: (id: string) => void
}

export function StudiosTable({ studios, onEdit, onDelete }: StudiosTableProps) {
  const { t } = useTranslation()

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Logo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead className="hidden md:table-cell">Description</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {studios.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                {t('catalog.studios.noStudios')}
              </TableCell>
            </TableRow>
          ) : (
            studios.map((studio) => (
              <TableRow key={studio.id}>
                <TableCell>
                  {studio.logo_url !== null && studio.logo_url !== '' ? (
                    <img
                      src={studio.logo_url}
                      alt={studio.name}
                      className="size-10 rounded-md object-contain"
                    />
                  ) : (
                    <div className="bg-muted flex size-10 items-center justify-center rounded-md">
                      <Building2 className="text-muted-foreground size-5" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{studio.name}</TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">
                  {studio.slug}
                </TableCell>
                <TableCell className="hidden max-w-xs truncate md:table-cell">
                  {studio.description ?? '-'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t('common.actions.actions')}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          onEdit(studio)
                        }}
                      >
                        <Edit className="mr-2 size-4" />
                        {t('common.actions.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          onDelete(studio.id)
                        }}
                      >
                        <Trash2 className="mr-2 size-4" />
                        {t('common.actions.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
