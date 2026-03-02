import { Edit, MoreHorizontal, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import type { Collection } from '../../types/catalog.types'

interface CollectionsTableProps {
  collections: Collection[]
  onEdit: (collection: Collection) => void
  onDelete: (id: string) => void
}

export function CollectionsTable({ collections, onEdit, onDelete }: CollectionsTableProps) {
  const { t } = useTranslation()

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('catalog.collections.collectionTitle')}</TableHead>
            <TableHead>{t('catalog.collections.slug')}</TableHead>
            <TableHead className="w-[100px]">{t('common.labels.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collections.map((collection) => (
            <TableRow key={collection.id}>
              <TableCell className="font-medium">{collection.title}</TableCell>
              <TableCell>{collection.slug}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        onEdit(collection)
                      }}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 size-4" />
                      {t('common.actions.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        onDelete(collection.id)
                      }}
                      className="text-destructive cursor-pointer"
                    >
                      <Trash2 className="mr-2 size-4" />
                      {t('common.actions.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {collections.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center">
                {t('catalog.collections.noCollections')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
