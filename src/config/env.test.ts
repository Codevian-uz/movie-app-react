import { describe, expect, it } from 'vitest'
import { env } from './env'

describe('env config', () => {
  it('has a default apiBaseUrl', () => {
    expect(env.apiBaseUrl).toBe('/api')
  })

  it('exposes isDev and isProd as booleans', () => {
    expect(typeof env.isDev).toBe('boolean')
    expect(typeof env.isProd).toBe('boolean')
  })

  it('isDev and isProd are mutually exclusive', () => {
    expect(env.isDev).not.toBe(env.isProd)
  })
})
