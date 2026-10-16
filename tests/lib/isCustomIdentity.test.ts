import { describe, expect, it } from 'vitest'
import { isCustomIdentity } from '@/lib/isCustomIdentity'

describe('isCustomIdentity()', () => {
  it('should match a custom identity name', () => {
    expect(isCustomIdentity('Work (de-ber-wg-101)')).toBe(true)
  })

  it('should not match a generated identity name', () => {
    expect(isCustomIdentity('Calgary, Canada (ca-yyc-wg-202)')).toBe(false)
  })

  it('should not match a default browser container name', () => {
    expect(isCustomIdentity('Personal')).toBe(false)
  })
})
