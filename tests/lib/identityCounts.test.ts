import { describe, expect, it } from 'vitest'
import { countIdentities, formatIdentityCounts } from '@/lib/identityCounts'

const custom = { name: 'Work (de-ber-wg-101)', cookieStoreId: 'firefox-container-1' }
const usedRandom = { name: 'Paris, France (fr-par-wg-001)', cookieStoreId: 'firefox-container-2' }
const unusedRandom = { name: 'Berlin, Germany (de-ber-wg-102)', cookieStoreId: 'firefox-container-3' }
const defaultContainer = { name: 'Personal', cookieStoreId: 'firefox-container-4' }

describe('countIdentities()', () => {
  it('should count custom, random, and unused identities', () => {
    expect(countIdentities([custom, usedRandom, unusedRandom], new Set(['firefox-container-2']))).toEqual({
      custom: 1,
      random: 2,
      unused: 1
    })
  })

  it('should ignore containers without a custom identity name', () => {
    expect(countIdentities([defaultContainer], new Set())).toEqual({
      custom: 0,
      random: 0,
      unused: 0
    })
  })

  it('should not count custom identities as unused', () => {
    expect(countIdentities([custom], new Set())).toEqual({
      custom: 1,
      random: 0,
      unused: 0
    })
  })

  it('should return zero counts for no identities', () => {
    expect(countIdentities([], new Set())).toEqual({
      custom: 0,
      random: 0,
      unused: 0
    })
  })
})

describe('formatIdentityCounts()', () => {
  it('should format counts', () => {
    expect(formatIdentityCounts({ custom: 5, random: 40, unused: 38 })).toBe('5 Custom, 40 Random (38 unused)')
  })

  it('should format zero counts', () => {
    expect(formatIdentityCounts({ custom: 0, random: 0, unused: 0 })).toBe('0 Custom, 0 Random (0 unused)')
  })
})
