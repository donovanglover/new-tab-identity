import { describe, expect, it, vi } from 'vitest'
import { newTabWithServer, sanitizeIdentityName, sanitizeIdentityNameInput } from '@/lib/newTabWithServer'
import type { IMullvadServerWireguard } from '@/types/MullvadServer'

const browserMock = {
  contextualIdentities: {
    create: vi.fn<typeof browser.contextualIdentities.create>(async () => ({
      name: 'Calgary, Canada (ca-yyc-wg-202)',
      icon: 'tree',
      color: 'pink',
      iconUrl: 'resource://usercontext-content/tree.svg',
      colorCode: '#ff4bda',
      cookieStoreId: 'firefox-container-7'
    }))
  },

  tabs: {
    create: vi.fn<typeof browser.tabs.create>(async () => ({
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

describe('sanitizeIdentityNameInput()', () => {
  it('should keep spaces so multi-word names can be typed', () => {
    expect(sanitizeIdentityNameInput('My Work ')).toBe('My Work ')
  })

  it('should remove commas and parentheses', () => {
    expect(sanitizeIdentityNameInput('Wo(rk, EU)')).toBe('Work EU')
  })

  it('should cap the name at 20 characters', () => {
    expect(sanitizeIdentityNameInput('a'.repeat(30))).toBe('a'.repeat(20))
  })
})

describe('sanitizeIdentityName()', () => {
  it('should remove commas and parentheses', () => {
    expect(sanitizeIdentityName('Wo(rk, EU)')).toBe('Work EU')
  })

  it('should trim surrounding whitespace', () => {
    expect(sanitizeIdentityName('  Work  ')).toBe('Work')
  })

  it('should cap the name at 20 characters', () => {
    expect(sanitizeIdentityName('a'.repeat(30))).toBe('a'.repeat(20))
  })
})

describe('newTabWithServer()', () => {
  it('should create the new tab successfully after creating the container', async () => {
    expect(await newTabWithServer(server)).toEqual(await browserMock.tabs.create({}))
  })

  it('should name the container after the server by default', async () => {
    await newTabWithServer(server)

    expect(browserMock.contextualIdentities.create).toHaveBeenLastCalledWith({
      name: 'Calgary, Canada (ca-yyc-wg-202)',
      color: expect.any(String),
      icon: expect.any(String)
    })
  })

  it('should use the sanitized identity name when provided', async () => {
    await newTabWithServer(server, { name: '  Wo(rk, EU)  ' })

    expect(browserMock.contextualIdentities.create).toHaveBeenLastCalledWith({
      name: 'Work EU (ca-yyc-wg-202)',
      color: expect.any(String),
      icon: expect.any(String)
    })
  })

  it('should fall back to the generated name when the identity name is empty', async () => {
    await newTabWithServer(server, { name: '  ,()  ' })

    expect(browserMock.contextualIdentities.create).toHaveBeenLastCalledWith({
      name: 'Calgary, Canada (ca-yyc-wg-202)',
      color: expect.any(String),
      icon: expect.any(String)
    })
  })

  it('should open the new tab page by omitting the URL', async () => {
    await newTabWithServer(server)

    expect(browserMock.tabs.create).toHaveBeenLastCalledWith({
      cookieStoreId: 'firefox-container-7'
    })
  })

  it('should use the provided URL', async () => {
    await newTabWithServer(server, { url: 'https://example.com/' })

    expect(browserMock.tabs.create).toHaveBeenLastCalledWith({
      url: 'https://example.com/',
      cookieStoreId: 'firefox-container-7'
    })
  })
})
