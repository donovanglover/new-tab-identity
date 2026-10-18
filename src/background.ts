import { fetchMullvad } from '@/lib/fetchMullvad'
import { t } from '@/lib/i18n'
import { newTabWithServer } from '@/lib/newTabWithServer'
import { nextUnusedServer } from '@/lib/nextUnusedServer'
import { serverInLocation } from '@/lib/serverInLocation'
import type { ProxyInfo } from '@/types/ProxyInfo'
import type { StorageLocal, StorageSync } from '@/types/StorageAll'
import { storageInit } from './lib/storageInit'

await storageInit({
  sync: {
    provider: 'mullvad',
    blockDefault: false,
    country: null,
    city: null,
  },

  local: {
    servers: [],
    used: [],
    usedAt: 0,
    lastUpdated: 0,
    identityUrls: {},
  },
})

if (
  Date.now() -
    ((await browser.storage.local.get('lastUpdated')) as Pick<StorageLocal, 'lastUpdated'>)
      .lastUpdated >
  60 * 60 * 1000
) {
  try {
    const servers = await fetchMullvad()

    await browser.storage.local.set({
      servers,
      lastUpdated: Date.now(),
    })
  } catch {
    await browser.storage.local.set({
      lastUpdated: 0,
    })
  }
}

browser.proxy.onRequest.addListener(
  async (requestInfo): Promise<ProxyInfo> => {
    const containerId = requestInfo.cookieStoreId

    if (containerId === undefined) {
      return { type: 'direct' }
    }

    if (containerId === 'firefox-default') {
      return ((await browser.storage.sync.get('blockDefault')) as Pick<StorageSync, 'blockDefault'>)
        .blockDefault
        ? { type: 'http', host: '127.0.0.1', port: 65535 }
        : { type: 'direct' }
    }

    const container = await browser.contextualIdentities.get(containerId)
    const hostname = /\(([^)]+)\)/.exec(container.name)?.[1]

    if (hostname === undefined) {
      return {
        type: 'direct',
      }
    }

    return {
      type: 'socks',
      host: `${hostname.replace('-wg-', '-wg-socks5-')}.relays.mullvad.net`,
      proxyDNS: true,
      port: 1080,
    }
  },
  { urls: ['<all_urls>'] },
)

browser.proxy.onError.addListener((error) => {
  console.warn(error.message)
})

async function updateContextMenu(): Promise<void> {
  const { country, city } = (await browser.storage.sync.get(['country', 'city'])) as Pick<
    StorageSync,
    'country' | 'city'
  >
  const { servers } = (await browser.storage.local.get('servers')) as Pick<StorageLocal, 'servers'>
  const location = city ?? country

  if (location === null) {
    await browser.contextMenus.update('new-tab-identity', {
      title: t('openWithNewIdentity'),
      enabled: true,
    })

    return
  }

  await browser.contextMenus.update('new-tab-identity', {
    title: t('openWithNewIdentityLocation', [location.name]),
    enabled: servers.some((server) => serverInLocation(server, country, city)),
  })
}

browser.contextMenus.create({
  id: 'new-tab-identity',
  title: t('openWithNewIdentity'),
  contexts: ['image', 'audio', 'video', 'link', 'page', 'tab'],
})

await updateContextMenu()

browser.storage.onChanged.addListener((changes) => {
  if ('country' in changes || 'city' in changes || 'servers' in changes) {
    void updateContextMenu()
  }
})

let contextMenuQueue = Promise.resolve()

browser.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== 'new-tab-identity') return

  contextMenuQueue = contextMenuQueue
    .then(async () => {
      const { country, city } = (await browser.storage.sync.get(['country', 'city'])) as Pick<
        StorageSync,
        'country' | 'city'
      >
      const { servers, used, usedAt } = (await browser.storage.local.get([
        'servers',
        'used',
        'usedAt',
      ])) as Pick<StorageLocal, 'servers' | 'used' | 'usedAt'>
      const pool = servers.filter((server) => serverInLocation(server, country, city))
      const now = Date.now()
      const expired = usedAt !== 0 && now - usedAt > 60 * 60 * 1000
      const next = nextUnusedServer(pool, expired ? [] : used, city === null ? 'city' : 'relay')

      if (next === undefined) {
        return
      }

      await browser.storage.local.set({
        used: next.used,
        usedAt: now,
      })

      await newTabWithServer(next.server, {
        url: info.srcUrl ?? info.linkUrl ?? info.pageUrl,
      })
    })
    .catch((error) => {
      console.warn(error)
    })
})
