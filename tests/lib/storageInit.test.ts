import { describe, expect, it, vi } from 'vitest'
import { storageInit } from '@/lib/storageInit'
import type { StorageAll } from '@/types/StorageAll'

const browserMock = {
  storage: {
    sync: {
      get: vi.fn<typeof browser.storage.sync.get>(async () => ({ blockDefault: true })),
      set: vi.fn<typeof browser.storage.sync.set>(async () => {})
    },

    local: {
      get: vi.fn<typeof browser.storage.local.get>(async () => ({})),
      set: vi.fn<typeof browser.storage.local.set>(async () => {})
    }
  }
}

vi.stubGlobal('browser', browserMock)

const defaultStorage: StorageAll = {
  sync: {
    provider: 'mullvad',
    blockDefault: false,
    country: null,
    city: null
  },

  local: {
    servers: [],
    used: [],
    usedAt: 0,
    lastUpdated: 0
  }
}

describe('storageInit()', () => {
  it('should initialize with default values with existing browser storage values taking priority', async () => {
    expect(await storageInit(defaultStorage)).toEqual({
      sync: {
        provider: 'mullvad',
        blockDefault: true,
        country: null,
        city: null
      },

      local: {
        servers: [],
        used: [],
        usedAt: 0,
        lastUpdated: 0
      }
    })
  })
})
