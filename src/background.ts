import { fetchMullvad } from './lib/fetchMullvad'
import type { ProxyInfo } from './types/ProxyInfo'
import { defaultStorage } from './types/StorageAll'

await browser.storage.sync.set({ ...defaultStorage.sync, ...await browser.storage.sync.get(null) })
await browser.storage.local.set({ ...defaultStorage.local, ...await browser.storage.local.get(null) })

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
      return (await browser.storage.local.get('blockDefault')).blockDefault === true
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
