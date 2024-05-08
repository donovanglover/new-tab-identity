import { fetchMullvad } from '@/lib/fetchMullvad'
import { newTabWithServer } from '@/lib/newTabWithServer'
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
  throw error
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

browser.contextMenus.onClicked.addListener(async info => {
  if (info.menuItemId !== 'new-tab-identity') return

  const servers = (await browser.storage.local.get('servers') as Pick<StorageLocal, 'servers'>).servers
  const server = servers[Math.floor(Math.random() * servers.length)]

  await newTabWithServer(server, {
    url: info.srcUrl ?? info.linkUrl ?? info.pageUrl
  })
})
