import { describe, expect, it } from 'vitest'
import { isAutoContainer } from '@/lib/isAutoContainer'

describe('isAutoContainer()', () => {
  it('should match a generated container name', () => {
    expect(isAutoContainer('Calgary, Canada (ca-yyc-wg-202)')).toBe(true)
  })

  it('should match a generated name when the city name contains a comma', () => {
    expect(isAutoContainer('Salt Lake City, UT, USA (us-slc-wg-101)')).toBe(true)
  })

  it('should not match a renamed container', () => {
    expect(isAutoContainer('Work (ca-yyc-wg-202)')).toBe(false)
  })

  it('should not match names without a comma', () => {
    expect(isAutoContainer('Work')).toBe(false)
    expect(isAutoContainer('')).toBe(false)
  })
})
