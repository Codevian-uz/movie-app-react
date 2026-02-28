import { Edit, MoreHorizontal, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { useAuthenticatedFile } from '@/features/filevault'
import { useTranslation } from '@/lib/i18n'
import type { Person } from '../../types/catalog.types'

interface PeopleTableProps {
  people: Person[]
  onEdit: (person: Person) => void
  onDelete: (id: string) => void
}

export function PeopleTable({ people, onEdit, onDelete }: PeopleTableProps) {
  const { t } = useTranslation()

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">{t('catalog.people.photo')}</TableHead>
            <TableHead>{t('catalog.people.fullName')}</TableHead>
            <TableHead className="w-[100px]">{t('common.labels.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {people.map((person) => (
            <TableRow key={person.id}>
              <TableCell>
                <PersonAvatar photoUrl={person.photo_url} name={person.full_name} />
              </TableCell>
              <TableCell className="font-medium">{person.full_name}</TableCell>
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
                        onEdit(person)
                      }}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 size-4" />
                      {t('common.actions.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        onDelete(person.id)
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
          {people.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center">
                {t('catalog.people.noPeople')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function PersonAvatar({ photoUrl, name }: { photoUrl: string | null; name: string }) {
  const { objectUrl } = useAuthenticatedFile(photoUrl)

  return (
    <Avatar className="size-10">
      <AvatarImage src={objectUrl ?? ''} alt={name} className="object-cover" />
      <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  )
}
