import { describe, expect, it } from 'vitest'
import { sanitizeNewTabUrl } from '@/lib/sanitizeNewTabUrl'

describe('sanitizeNewTabUrl()', () => {
  it('should return undefined for an empty string', () => {
    expect(sanitizeNewTabUrl('')).toBeUndefined()
  })

  it('should return undefined for whitespace only', () => {
    expect(sanitizeNewTabUrl('   ')).toBeUndefined()
  })

  it('should trim surrounding whitespace', () => {
    expect(sanitizeNewTabUrl('  https://example.com/  ')).toBe('https://example.com/')
  })

  it('should prepend https when the scheme is missing', () => {
    expect(sanitizeNewTabUrl('example.com')).toBe('https://example.com/')
  })

  it('should keep http URLs', () => {
    expect(sanitizeNewTabUrl('http://example.com/')).toBe('http://example.com/')
  })

  it('should reject about: URLs', () => {
    expect(sanitizeNewTabUrl('about:blank')).toBeUndefined()
    expect(sanitizeNewTabUrl('about:config')).toBeUndefined()
  })

  it('should reject other schemes', () => {
    expect(sanitizeNewTabUrl('ftp://example.com/')).toBeUndefined()
    expect(sanitizeNewTabUrl('javascript:alert(1)')).toBeUndefined()
  })

  it('should reject malformed URLs', () => {
    expect(sanitizeNewTabUrl('https://exa mple.com')).toBeUndefined()
  })

  it('should normalize URLs', () => {
    expect(sanitizeNewTabUrl('HTTPS://EXAMPLE.com/Path')).toBe('https://example.com/Path')
  })
})
