import { describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/lib/api-client'
import {
  createGenre,
  createMovie,
  createPerson,
  deleteGenre,
  deleteMovie,
  deletePerson,
  getMovie,
  getPerson,
  listGenres,
  listMovies,
  listPeople,
  updateGenre,
  updateMovie,
  updatePerson,
} from './catalog.api'

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('catalog api', () => {
  it('listMovies calls correct endpoint', async () => {
    const spy = vi
      .spyOn(apiClient, 'get')
      .mockResolvedValueOnce({ data: { content: [], count: 0 } })
    await listMovies({ page_size: 10 })
    expect(spy).toHaveBeenCalledWith('v1/catalog/movies', { params: { page_size: 10 } })
  })

  it('getMovie calls correct endpoint', async () => {
    const spy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: { id: '1' } })
    await getMovie('1')
    expect(spy).toHaveBeenCalledWith('v1/catalog/movies/get', { params: { id: '1' } })
  })

  it('createMovie calls correct endpoint', async () => {
    const spy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { id: '1' } })
    await createMovie({ title: 'Test', kind: 'movie' })
    expect(spy).toHaveBeenCalledWith('v1/catalog/movies', { title: 'Test', kind: 'movie' })
  })

  it('updateMovie calls correct endpoint', async () => {
    const spy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { id: '1' } })
    await updateMovie({ id: '1', title: 'Updated' })
    expect(spy).toHaveBeenCalledWith('v1/catalog/movies/update', { id: '1', title: 'Updated' })
  })

  it('deleteMovie calls correct endpoint', async () => {
    const spy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { id: '1' } })
    await deleteMovie('1')
    expect(spy).toHaveBeenCalledWith('v1/catalog/movies/delete', { id: '1' })
  })

  it('listGenres calls correct endpoint', async () => {
    const spy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: { content: [] } })
    await listGenres({ page_number: 1 })
    expect(spy).toHaveBeenCalledWith('v1/catalog/genres', { params: { page_number: 1 } })
  })

  it('createGenre calls correct endpoint', async () => {
    const spy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { id: '1' } })
    await createGenre({ name: 'Action' })
    expect(spy).toHaveBeenCalledWith('v1/catalog/genres', { name: 'Action' })
  })

  it('updateGenre calls correct endpoint', async () => {
    const spy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { id: '1' } })
    await updateGenre({ id: '1', name: 'New Action' })
    expect(spy).toHaveBeenCalledWith('v1/catalog/genres/update', { id: '1', name: 'New Action' })
  })

  it('deleteGenre calls correct endpoint', async () => {
    const spy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { id: '1' } })
    await deleteGenre('1')
    expect(spy).toHaveBeenCalledWith('v1/catalog/genres/delete', { id: '1' })
  })

  it('listPeople calls correct endpoint', async () => {
    const spy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: { content: [] } })
    await listPeople({ page_number: 1 })
    expect(spy).toHaveBeenCalledWith('v1/catalog/people', { params: { page_number: 1 } })
  })

  it('getPerson calls correct endpoint', async () => {
    const spy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: { id: '1' } })
    await getPerson('1')
    expect(spy).toHaveBeenCalledWith('v1/catalog/people/get', { params: { id: '1' } })
  })

  it('createPerson calls correct endpoint', async () => {
    const spy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { id: '1' } })
    await createPerson({ full_name: 'John Doe' })
    expect(spy).toHaveBeenCalledWith('v1/catalog/people', { full_name: 'John Doe' })
  })

  it('updatePerson calls correct endpoint', async () => {
    const spy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { id: '1' } })
    await updatePerson({ id: '1', full_name: 'Jane Doe' })
    expect(spy).toHaveBeenCalledWith('v1/catalog/people/update', { id: '1', full_name: 'Jane Doe' })
  })

  it('deletePerson calls correct endpoint', async () => {
    const spy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { id: '1' } })
    await deletePerson('1')
    expect(spy).toHaveBeenCalledWith('v1/catalog/people/delete', { id: '1' })
  })
})
