import { describe, expect, it } from 'vitest'
import { identityParts } from '@/lib/identityParts'

describe('identityParts()', () => {
  it('should split a custom identity name', () => {
    expect(identityParts('Work (de-ber-wg-101)')).toEqual({
      custom: 'Work',
      hostname: 'de-ber-wg-101',
    })
  })

  it('should split a generated identity name', () => {
    expect(identityParts('Calgary, Canada (ca-yyc-wg-202)')).toEqual({
      custom: 'Calgary, Canada',
      hostname: 'ca-yyc-wg-202',
    })
  })

  it('should trim the custom part', () => {
    expect(identityParts('  Work  (de-ber-wg-101)')).toEqual({
      custom: 'Work',
      hostname: 'de-ber-wg-101',
    })
  })

  it('should return the name as the custom part when there is no hostname', () => {
    expect(identityParts('Work')).toEqual({
      custom: 'Work',
      hostname: undefined,
    })
  })
})
