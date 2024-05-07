import { fetchMullvad } from './lib/fetchMullvad'
import type { ProxyInfo } from './types/ProxyInfo'
import { defaultStorage, type StorageLocal, type StorageSync } from './types/StorageAll'

await browser.storage.sync.set({ ...defaultStorage.sync, ...await browser.storage.sync.get(null) })
await browser.storage.local.set({ ...defaultStorage.local, ...await browser.storage.local.get(null) })

if (Date.now() - (await browser.storage.local.get('lastUpdated') as Pick<StorageLocal, 'lastUpdated'>).lastUpdated > 60 * 60 * 1000) {
  await browser.storage.local.set({
    servers: await fetchMullvad(),
    lastUpdated: Date.now()
  })
}

browser.proxy.onRequest.addListener(
  async (requestInfo): Promise<ProxyInfo> => {
    const containerId = requestInfo.cookieStoreId

    if (containerId === undefined) {
      console.warn('Got unknown container, which should never happen.')

      return {
        type: 'direct'
      }
    }

    if (containerId === 'firefox-default') {
      return (await browser.storage.sync.get('blockDefault') as Pick<StorageSync, 'blockDefault'>).blockDefault
        ? {
            type: 'http',
            host: '127.0.0.1',
            port: 65535
          }
        : {
            type: 'direct'
          }
    }

    const context = await browser.contextualIdentities.get(containerId)
    console.log(context)

    return {
      type: 'socks',
      host: context.name,
      proxyDNS: true,
      port: 1080
    }
  },
  {
    urls: ['<all_urls>']
  }
)

browser.proxy.onError.addListener(error => {
  throw error
})

browser.tabs.onCreated.addListener(tab => {
  console.log(tab)
})

browser.contextMenus.create({
  id: 'new-tab-identity',
  title: 'Open with New Identity',
  contexts: [
    'link',
    'page',
    'tab'
  ]
})

browser.contextMenus.onClicked.addListener(async info => {
  if (info.menuItemId !== 'new-tab-identity') return

  await browser.tabs.create({
    url: info.linkUrl ?? info.pageUrl,
    cookieStoreId: 'firefox-default'
  })
})
