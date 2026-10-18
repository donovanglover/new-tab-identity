import { describe, expect, it } from 'vitest'
import { serverInLocation } from '@/lib/serverInLocation'
import type { IMullvadServerWireguard } from '@/types/MullvadServer'

const server: IMullvadServerWireguard = {
  active: true,
  city_code: 'ber',
  city_name: 'Berlin',
  country_code: 'de',
  country_name: 'Germany',
  daita: false,
  fqdn: 'de-ber-wg-101.relays.mullvad.net',
  hostname: 'de-ber-wg-101',
  ipv4_addr_in: '38.240.225.68',
  ipv6_addr_in: '2606:9580:438:64::b02f',
  multihop_port: 3178,
  network_port_speed: 10,
  owned: false,
  provider: 'techfutures',
  pubkey: 'u9J/fzrSqM2aEFjTs91KEKgBsaQ/I/4XkIP1Z/zYkXA=',
  socks_name: 'de-ber-wg-socks5-101.relays.mullvad.net',
  socks_port: 1080,
  status_messages: [],
  stboot: true,
  type: 'wireguard',
}

describe('serverInLocation()', () => {
  it('should match every server when no location is configured', () => {
    expect(serverInLocation(server, null, null)).toBe(true)
  })

  it('should never match when a city is configured without a country', () => {
    expect(serverInLocation(server, null, { code: 'ber', name: 'Berlin' })).toBe(false)
  })

  it('should match a server in the configured country', () => {
    expect(serverInLocation(server, { code: 'de', name: 'Germany' }, null)).toBe(true)
  })

  it('should not match a server outside the configured country', () => {
    expect(serverInLocation(server, { code: 'ch', name: 'Switzerland' }, null)).toBe(false)
  })

  it('should match a server in the configured city', () => {
    expect(
      serverInLocation(server, { code: 'de', name: 'Germany' }, { code: 'ber', name: 'Berlin' }),
    ).toBe(true)
  })

  it('should not match a server outside the configured city', () => {
    expect(
      serverInLocation(server, { code: 'de', name: 'Germany' }, { code: 'fra', name: 'Frankfurt' }),
    ).toBe(false)
  })
})
