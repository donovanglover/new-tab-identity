import { describe, expect, it, vi } from 'vitest'
import { newTabWithServer } from '@/lib/newTabWithServer'
import type { IMullvadServerWireguard } from '@/types/MullvadServer'

const browserMock = {
  contextualIdentities: {
    create: vi.fn((): browser.contextualIdentities.ContextualIdentity => ({
      name: 'Calgary, Canada (ca-yyc-wg-202)',
      icon: 'tree',
      color: 'pink',
      iconUrl: 'resource://usercontext-content/tree.svg',
      colorCode: '#ff4bda',
      cookieStoreId: 'firefox-container-7'
    }))
  },

  tabs: {
    create: vi.fn((): browser.tabs.Tab => ({
      active: true,
      attention: false,
      audible: false,
      autoDiscardable: true,
      cookieStoreId: 'firefox-container-7',
      discarded: false,
      height: 947,
      hidden: false,
      highlighted: true,
      id: 5,
      incognito: false,
      index: 4,
      isArticle: undefined,
      isInReaderMode: undefined,
      lastAccessed: 1715160840455,
      mutedInfo: {
        muted: false
      },
      pinned: false,
      sharingState: {
        camera: false,
        microphone: false,
        screen: undefined
      },
      status: 'complete',
      successorTabId: -1,
      width: 1920,
      windowId: 1
    }))
  }
}

vi.stubGlobal('browser', browserMock)

const server: IMullvadServerWireguard = {
  active: true,
  city_code: 'yyc',
  city_name: 'Calgary',
  country_code: 'ca',
  country_name: 'Canada',
  daita: false,
  fqdn: 'ca-yyc-wg-202.relays.mullvad.net',
  hostname: 'ca-yyc-wg-202',
  ipv4_addr_in: '38.240.225.68',
  ipv6_addr_in: '2606:9580:438:64::b02f',
  multihop_port: 3178,
  network_port_speed: 10,
  owned: false,
  provider: 'techfutures',
  pubkey: 'u9J/fzrSqM2aEFjTs91KEKgBsaQ/I/4XkIP1Z/zYkXA=',
  socks_name: 'ca-yyc-wg-socks5-202.relays.mullvad.net',
  socks_port: 1080,
  status_messages: [],
  stboot: true,
  type: 'wireguard'
}

describe('newTabWithServer()', () => {
  it('should create the new tab successfully after creating the container', async () => {
    expect(await newTabWithServer(server)).toEqual(browserMock.tabs.create())
  })
})
