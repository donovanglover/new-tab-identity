import { describe, expect, it } from 'vitest'
import { BrowserProxy } from '../src/lib/BrowserProxy'

describe('BrowserProxy', () => {
  it('should create a new proxy', () => {
    expect(new BrowserProxy()).toBeDefined()
  })
})
