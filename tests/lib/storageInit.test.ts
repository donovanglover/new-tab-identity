import { describe, expect, it, vi } from 'vitest'
import { storageInit } from '@/lib/storageInit'
import type { StorageAll } from '@/types/StorageAll'

const browserMock = {
  storage: {
    sync: {
      get: vi.fn(async (_: string | string[] | Record<string, any> | null | undefined): Promise<Record<string, any>> => ({ blockDefault: true })),
      set: vi.fn(async (_: Record<string, any>): Promise<void> => {})
    },

    local: {
      get: vi.fn(async (_: string | string[] | Record<string, any> | null | undefined): Promise<Record<string, any>> => ({})),
      set: vi.fn(async (_: Record<string, any>): Promise<void> => {})
    }
  }
}

vi.stubGlobal('browser', browserMock)

const defaultStorage: StorageAll = {
  sync: {
    provider: 'mullvad',
    blockDefault: false
  },

  local: {
    servers: [],
    lastUpdated: 0
  }
}

describe('storageInit()', () => {
  it('should initialize with default values with existing browser storage values taking priority', async () => {
    expect(await storageInit(defaultStorage)).toEqual({
      sync: {
        provider: 'mullvad',
        blockDefault: true
      },

      local: {
        servers: [],
        lastUpdated: 0
      }
    })
  })
})
