import type { IMullvadServerWireguard } from '@/types/MullvadServer'

export interface StoredLocation {
  code: string
  name: string
}

export interface StorageSync {
  provider: 'mullvad'
  blockDefault: boolean
  country: StoredLocation | null
  city: StoredLocation | null
}

export interface StorageLocal {
  servers: IMullvadServerWireguard[]
  used: string[]
  usedAt: number
  lastUpdated: number
}

export interface StorageAll {
  sync: StorageSync
  local: StorageLocal
}
