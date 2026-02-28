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
import type { Genre } from '../../types/catalog.types'

interface GenresTableProps {
  genres: Genre[]
  onEdit: (genre: Genre) => void
  onDelete: (id: string) => void
}

export function GenresTable({ genres, onEdit, onDelete }: GenresTableProps) {
  const { t } = useTranslation()

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('catalog.genres.genreName')}</TableHead>
            <TableHead>{t('catalog.genres.slug')}</TableHead>
            <TableHead className="w-[100px]">{t('common.labels.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {genres.map((genre) => (
            <TableRow key={genre.id}>
              <TableCell className="font-medium">{genre.name}</TableCell>
              <TableCell>{genre.slug}</TableCell>
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
                        onEdit(genre)
                      }}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 size-4" />
                      {t('common.actions.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        onDelete(genre.id)
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
          {genres.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center">
                {t('catalog.genres.noGenres')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
