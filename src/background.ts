import { fetchMullvad } from './lib/fetchMullvad'
import type { ProxyInfo } from './types/ProxyInfo'

void browser.storage.sync.get(null).then(sync => {
  if (sync.provider === undefined) {
    void browser.storage.sync.set({
      provider: 'mullvad'
    })
  }

  if (sync.blockDefault === undefined) {
    void browser.storage.sync.set({
      blockDefault: false
    })
  }

  if (sync.provider === undefined || sync.provider === 'mullvad') {
    void browser.storage.local.get(null).then(local => {
      if (local.servers === undefined) {
        void fetchMullvad().then(servers => {
          void browser.storage.local.set({
            servers
          })
        })
      }
    })
  }
})

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
      return blockDefault
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
