import type { StorageAll } from '@/types/StorageAll'

export async function storageInit (storage: StorageAll): Promise<StorageAll> {
  const storageSync = { ...storage.sync, ...await browser.storage.sync.get(null) }
  const storageLocal = { ...storage.local, ...await browser.storage.local.get(null) }

  await browser.storage.sync.set(storageSync)
  await browser.storage.local.set(storageLocal)

  return {
    sync: storageSync,
    local: storageLocal
  }
}
