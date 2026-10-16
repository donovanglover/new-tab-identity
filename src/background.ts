import { fetchMullvad } from '@/lib/fetchMullvad'
import { newTabWithServer } from '@/lib/newTabWithServer'
import { nextUnusedServer } from '@/lib/nextUnusedServer'
import type { ProxyInfo } from '@/types/ProxyInfo'
import type { StorageLocal, StorageSync } from '@/types/StorageAll'
import { storageInit } from './lib/storageInit'

await storageInit({
  sync: {
    provider: 'mullvad',
    blockDefault: false
  },

  local: {
    servers: [],
    usedCities: [],
    lastUpdated: 0
  }
})

if (Date.now() - (await browser.storage.local.get('lastUpdated') as Pick<StorageLocal, 'lastUpdated'>).lastUpdated > 60 * 60 * 1000) {
  try {
    const servers = await fetchMullvad()

    await browser.storage.local.set({
      servers,
      lastUpdated: Date.now()
    })
  } catch {
    await browser.storage.local.set({
      lastUpdated: 0
    })
  }
}

browser.proxy.onRequest.addListener(async (requestInfo): Promise<ProxyInfo> => {
  const containerId = requestInfo.cookieStoreId

  if (containerId === undefined) {
    return { type: 'direct' }
  }

  if (containerId === 'firefox-default') {
    return (await browser.storage.sync.get('blockDefault') as Pick<StorageSync, 'blockDefault'>).blockDefault
      ? { type: 'http', host: '127.0.0.1', port: 65535 }
      : { type: 'direct' }
  }

  const container = await browser.contextualIdentities.get(containerId)
  const hostname = /\(([^)]+)\)/.exec(container.name)?.[1]

  if (hostname === undefined) {
    return {
      type: 'direct'
    }
  }

  return {
    type: 'socks',
    host: `${hostname.replace('-wg-', '-wg-socks5-')}.relays.mullvad.net`,
    proxyDNS: true,
    port: 1080
  }
}, { urls: ['<all_urls>'] })

browser.proxy.onError.addListener(error => {
  console.warn(error.message)
})

browser.contextMenus.create({
  id: 'new-tab-identity',
  title: 'Open with New Identity',
  contexts: [
    'image',
    'audio',
    'video',
    'link',
    'page',
    'tab'
  ]
})

let contextMenuQueue = Promise.resolve()

browser.contextMenus.onClicked.addListener(info => {
  if (info.menuItemId !== 'new-tab-identity') return

  contextMenuQueue = contextMenuQueue
    .then(async () => {
      const { servers, usedCities } = await browser.storage.local.get(['servers', 'usedCities']) as Pick<StorageLocal, 'servers' | 'usedCities'>
      const next = nextUnusedServer(servers, usedCities)

      if (next === undefined) {
        return
      }

      await browser.storage.local.set({
        usedCities: next.usedCities
      })

      await newTabWithServer(next.server, {
        url: info.srcUrl ?? info.linkUrl ?? info.pageUrl
      })
    })
    .catch(error => {
      console.warn(error)
    })
})
