import type { IMullvadServerWireguard } from '@/types/MullvadServer'

export interface StorageSync {
  provider: 'mullvad'
  blockDefault: boolean
}

export interface StorageLocal {
  servers: IMullvadServerWireguard[]
  usedCities: string[]
  lastUpdated: number
}

export interface StorageAll {
  sync: StorageSync
  local: StorageLocal
}
