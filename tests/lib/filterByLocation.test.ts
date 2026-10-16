import { describe, expect, it } from 'vitest'
import { filterByLocation } from '@/lib/filterByLocation'
import { type IMullvadServerWireguard } from '@/types/MullvadServer'

describe('filterByLocation()', () => {
  const servers: IMullvadServerWireguard[] = [
    {
      active: true,
      city_code: 'sao',
      city_name: 'Sao Paulo',
      country_code: 'br',
      country_name: 'Brazil',
      daita: true,
      fqdn: 'br-sao-wg-201.relays.mullvad.net',
      hostname: 'br-sao-wg-201',
      ipv4_addr_in: '169.150.198.66',
      ipv6_addr_in: '2a02:6ea0:d00e:1::a01f',
      multihop_port: 3539,
      network_port_speed: 10,
      owned: false,
      provider: 'DataPacket',
      pubkey: '8c9M6w1BQbgMVr/Zgrj4GwSdU6q3qfQfWs17kMLC9y4=',
      socks_name: 'br-sao-wg-socks5-201.relays.mullvad.net',
      socks_port: 1080,
      status_messages: [],
      stboot: true,
      type: 'wireguard'
    },
    {
      active: true,
      city_code: 'sao',
      city_name: 'Sao Paulo',
      country_code: 'br',
      country_name: 'Brazil',
      daita: false,
      fqdn: 'br-sao-wg-202.relays.mullvad.net',
      hostname: 'br-sao-wg-202',
      ipv4_addr_in: '169.150.198.79',
      ipv6_addr_in: '2a02:6ea0:d00e:2::a02f',
      multihop_port: 3540,
      network_port_speed: 10,
      owned: false,
      provider: 'DataPacket',
      pubkey: 'jWURoz8SLBUlRTQnAFTA/LDZUTpvlO0ghiVWH7MgaHQ=',
      socks_name: 'br-sao-wg-socks5-202.relays.mullvad.net',
      socks_port: 1080,
      status_messages: [],
      stboot: true,
      type: 'wireguard'
    },
    {
      active: true,
      city_code: 'for',
      city_name: 'Fortaleza',
      country_code: 'br',
      country_name: 'Brazil',
      daita: false,
      fqdn: 'br-for-wg-001.relays.mullvad.net',
      hostname: 'br-for-wg-001',
      ipv4_addr_in: '98.98.12.178',
      ipv6_addr_in: '2604:980:e007:100::f001',
      multihop_port: 3010,
      network_port_speed: 10,
      owned: false,
      provider: 'Zenlayer',
      pubkey: 'CiPqGvrQidRVmKc6T8TORsAAZtQbsGzNEAKyd1iVlWY=',
      socks_name: 'br-for-wg-socks5-001.relays.mullvad.net',
      socks_port: 1080,
      status_messages: [],
      stboot: true,
      type: 'wireguard'
    },
    {
      active: true,
      city_code: 'zrh',
      city_name: 'Zurich',
      country_code: 'ch',
      country_name: 'Switzerland',
      daita: false,
      fqdn: 'ch-zrh-wg-001.relays.mullvad.net',
      hostname: 'ch-zrh-wg-001',
      ipv4_addr_in: '193.32.127.71',
      ipv6_addr_in: '2a03:1b20:a:f011:6::f001',
      multihop_port: 3241,
      network_port_speed: 20,
      owned: true,
      provider: '31173',
      pubkey: 'chvEpRH+05o+ESv8QLzNyY3Phirsym0mUvF03Kt7oCo=',
      socks_name: 'ch-zrh-wg-socks5-001.relays.mullvad.net',
      socks_port: 1080,
      status_messages: [],
      stboot: true,
      type: 'wireguard'
    },
    {
      active: true,
      city_code: 'zrh',
      city_name: 'Zurich',
      country_code: 'ch',
      country_name: 'Switzerland',
      daita: false,
      fqdn: 'ch-zrh-wg-002.relays.mullvad.net',
      hostname: 'ch-zrh-wg-002',
      ipv4_addr_in: '193.32.127.70',
      ipv6_addr_in: '2a03:1b20:a:f011:5::f001',
      multihop_port: 3125,
      network_port_speed: 20,
      owned: true,
      provider: '31173',
      pubkey: 'cq9ktmbTZwxYCrCSxV8SItOjRhJhLoYYkPThlifkkVI=',
      socks_name: 'ch-zrh-wg-socks5-002.relays.mullvad.net',
      socks_port: 1080,
      status_messages: [],
      stboot: true,
      type: 'wireguard'
    }
  ]

  const countries = filterByLocation(servers)

  it('should group servers by country', () => {
    expect(countries.map(country => country.name)).toEqual(['Brazil', 'Switzerland'])
  })

  it('should group servers by city within each country', () => {
    expect(countries[0].cities.map(city => city.name)).toEqual(['Sao Paulo', 'Fortaleza'])
    expect(countries[0].cities[0].servers.map(server => server.hostname)).toEqual(['br-sao-wg-201', 'br-sao-wg-202'])
    expect(countries[0].cities[1].servers.map(server => server.hostname)).toEqual(['br-for-wg-001'])
    expect(countries[1].cities.map(city => city.name)).toEqual(['Zurich'])
    expect(countries[1].cities[0].servers.map(server => server.hostname)).toEqual(['ch-zrh-wg-001', 'ch-zrh-wg-002'])
  })
})
