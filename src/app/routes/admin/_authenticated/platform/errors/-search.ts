export interface ErrorsListSearch {
  code?: string | undefined
  service?: string | undefined
  operation?: string | undefined
  search?: string | undefined
  from?: string | undefined
  to?: string | undefined
  page?: number | undefined
  pageSize?: number | undefined
}

export function parseErrorsListSearch(search: Record<string, unknown>): ErrorsListSearch {
  const page =
    typeof search.page === 'number'
      ? search.page
      : typeof search.page === 'string' && !Number.isNaN(Number(search.page))
        ? Number(search.page)
        : undefined

  const pageSize =
    typeof search.pageSize === 'number'
      ? search.pageSize
      : typeof search.pageSize === 'string' && !Number.isNaN(Number(search.pageSize))
        ? Number(search.pageSize)
        : undefined

  return {
    code: typeof search.code === 'string' ? search.code : undefined,
    service: typeof search.service === 'string' ? search.service : undefined,
    operation: typeof search.operation === 'string' ? search.operation : undefined,
    search: typeof search.search === 'string' ? search.search : undefined,
    from: typeof search.from === 'string' ? search.from : undefined,
    to: typeof search.to === 'string' ? search.to : undefined,
    page: page !== undefined && page >= 1 ? page : undefined,
    pageSize: pageSize !== undefined && pageSize >= 1 ? pageSize : undefined,
  }
}
