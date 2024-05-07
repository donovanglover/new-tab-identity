import { fetchMullvad } from './lib/fetchMullvad'
import type { ProxyInfo } from './types/ProxyInfo'
import { storage } from './types/StorageAll'

storage.sync = { ...storage.sync, ...await browser.storage.sync.get(null) }
storage.local = { ...storage.local, ...await browser.storage.local.get(null) }

if (storage.sync.provider === 'mullvad') {
  if (storage.local.servers.length === 0) {
    storage.local.servers = await fetchMullvad()

    await browser.storage.local.set({ servers: storage.local.servers })
  }
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
      return storage.sync.blockDefault
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
  console.error(`new-tab-identity(proxy-error): ${error.message}`)
})

browser.tabs.onCreated.addListener(tab => {
  console.log(tab)
})
