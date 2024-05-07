import type { IMullvadServerWireguard } from './MullvadServer'

export interface StorageSync {
  provider: 'mullvad'
  blockDefault: boolean
}

export interface StorageLocal {
  servers: IMullvadServerWireguard[]
}

export interface StorageAll {
  sync: StorageSync
  local: StorageLocal
}

export const storage: StorageAll = {
  sync: {
    provider: 'mullvad',
    blockDefault: false
  },

  local: {
    servers: []
  }
}
