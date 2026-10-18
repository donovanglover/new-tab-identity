import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextUnusedServer } from '@/lib/nextUnusedServer'
import type { IMullvadServerWireguard } from '@/types/MullvadServer'

function server(
  hostname: string,
  country_code: string,
  city_code: string,
): IMullvadServerWireguard {
  return {
    active: true,
    city_code,
    city_name: city_code,
    country_code,
    country_name: country_code,
    daita: false,
    fqdn: `${hostname}.relays.mullvad.net` as `${string}.relays.mullvad.net`,
    hostname,
    ipv4_addr_in: '38.240.225.68',
    ipv6_addr_in: '2606:9580:438:64::b02f',
    multihop_port: 3178,
    network_port_speed: 10,
    owned: false,
    provider: 'techfutures',
    pubkey: 'u9J/fzrSqM2aEFjTs91KEKgBsaQ/I/4XkIP1Z/zYkXA=',
    socks_name: `${hostname}.relays.mullvad.net` as `${string}.relays.mullvad.net`,
    socks_port: 1080,
    status_messages: [],
    stboot: true,
    type: 'wireguard',
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('nextUnusedServer()', () => {
  it('should return undefined when there are no servers', () => {
    expect(nextUnusedServer([], [])).toBeUndefined()
  })

  it('should pick a server from an unused city', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)

    const servers = [server('ca-yyc-wg-101', 'ca', 'yyc'), server('us-slc-wg-101', 'us', 'slc')]

    expect(nextUnusedServer(servers, ['ca-yyc'])).toEqual({
      server: servers[1],
      used: ['ca-yyc', 'us-slc'],
    })
  })

  it('should pick a random server within an unused city', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999)

    const servers = [
      server('ca-yyc-wg-101', 'ca', 'yyc'),
      server('ca-yyc-wg-102', 'ca', 'yyc'),
      server('us-slc-wg-101', 'us', 'slc'),
    ]

    expect(nextUnusedServer(servers, ['us-slc'])).toEqual({
      server: servers[1],
      used: ['us-slc', 'ca-yyc'],
    })
  })

  it('should pick an unused relay when deduping by relay', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)

    const servers = [server('de-ber-wg-101', 'de', 'ber'), server('de-ber-wg-102', 'de', 'ber')]

    expect(nextUnusedServer(servers, ['de-ber-wg-101'], 'relay')).toEqual({
      server: servers[1],
      used: ['de-ber-wg-101', 'de-ber-wg-102'],
    })
  })

  it('should ignore used cities that are no longer in the server list', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)

    const servers = [server('ca-yyc-wg-101', 'ca', 'yyc')]

    expect(nextUnusedServer(servers, ['de-fra'])).toEqual({
      server: servers[0],
      used: ['de-fra', 'ca-yyc'],
    })
  })

  it('should start a new cycle once every city has been used', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)

    const servers = [server('ca-yyc-wg-101', 'ca', 'yyc'), server('us-slc-wg-101', 'us', 'slc')]

    expect(nextUnusedServer(servers, ['ca-yyc', 'us-slc', 'de-fra'])).toEqual({
      server: servers[0],
      used: ['de-fra', 'ca-yyc'],
    })
  })

  it('should start a new relay cycle once every relay in the pool has been used', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)

    const servers = [server('de-ber-wg-101', 'de', 'ber'), server('de-ber-wg-102', 'de', 'ber')]

    expect(
      nextUnusedServer(servers, ['de-ber-wg-101', 'de-ber-wg-102', 'de-fra'], 'relay'),
    ).toEqual({
      server: servers[0],
      used: ['de-fra', 'de-ber-wg-101'],
    })
  })
})
