import { describe, expect, it } from 'vitest'
import { BrowserProxy } from '../src/lib/BrowserProxy.ts'

describe('BrowserProxy', () => {
  it('should create a new proxy', () => {
    expect(new BrowserProxy()).toBeDefined()
  })
})
