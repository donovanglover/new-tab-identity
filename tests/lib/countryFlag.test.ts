import { describe, expect, it } from 'vitest'
import { countryFlag } from '@/lib/countryFlag'

describe('countryFlag()', () => {
  it('should convert a lowercase country code to a flag emoji', () => {
    expect(countryFlag('br')).toEqual('🇧🇷')
  })

  it('should convert an uppercase country code to a flag emoji', () => {
    expect(countryFlag('CH')).toEqual('🇨🇭')
  })

  it('should return an empty string for an invalid country code', () => {
    expect(countryFlag('abc')).toEqual('')
  })
})
