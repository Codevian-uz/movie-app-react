import { PAGE_SIZE_OPTIONS } from '@/config/constants'
import { useTranslation } from '@/lib/i18n'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface TablePaginationProps {
  page?: number | undefined
  pageSize: number
  totalCount?: number | undefined
  onPageChange?: ((page: number) => void) | undefined
  onPageSizeChange: (size: number) => void
}

export function TablePagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  const { t } = useTranslation()
  const totalPages =
    totalCount !== undefined && totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1

  return (
    <div className="flex items-center justify-between">
      <div className="text-muted-foreground text-sm">
        {totalCount !== undefined &&
          t('common.labels.totalCount').replace('{count}', totalCount.toLocaleString())}
      </div>
      <div className="flex items-center gap-2">
        <Select
          value={String(pageSize)}
          onValueChange={(v) => {
            onPageSizeChange(Number(v))
          }}
        >
          <SelectTrigger className="h-8 w-[4.5rem] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {page !== undefined && onPageChange !== undefined && (
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => {
                onPageChange(page - 1)
              }}
            >
              {t('common.actions.back')}
            </Button>
            <span className="text-muted-foreground text-sm">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => {
                onPageChange(page + 1)
              }}
            >
              {t('common.actions.next')}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
