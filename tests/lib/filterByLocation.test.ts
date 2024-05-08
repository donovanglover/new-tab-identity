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
      daita: false,
      fqdn: 'br-sao-wg-001.relays.mullvad.net',
      hostname: 'br-sao-wg-001',
      ipv4_addr_in: '149.78.184.194',
      ipv6_addr_in: '2804:5364:7000:40::f001',
      multihop_port: 3194,
      network_port_speed: 1,
      owned: false,
      provider: 'Qnax',
      pubkey: 'xUDPh13sY127m+7d05SOQAzzNCyufTjaGwCXkWsIjkw=',
      socks_name: 'br-sao-wg-socks5-001.relays.mullvad.net',
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
      ipv4_addr_in: '193.32.127.66',
      ipv6_addr_in: '2a03:1b20:a:f011::f001',
      multihop_port: 3121,
      network_port_speed: 20,
      owned: true,
      provider: '31173',
      pubkey: '/iivwlyqWqxQ0BVWmJRhcXIFdJeo0WbHQ/hZwuXaN3g=',
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
      ipv4_addr_in: '193.32.127.67',
      ipv6_addr_in: '2a03:1b20:a:f011::f101',
      multihop_port: 3122,
      network_port_speed: 20,
      owned: true,
      provider: '31173',
      pubkey: 'qcvI02LwBnTb7aFrOyZSWvg4kb7zNW9/+rS6alnWyFE=',
      socks_name: 'ch-zrh-wg-socks5-002.relays.mullvad.net',
      socks_port: 1080,
      status_messages: [],
      stboot: true,
      type: 'wireguard'
    }
  ]

  const locations = filterByLocation(servers)

  it('should return the correct number of locations', () => {
    expect(locations.length).toEqual(3)
  })

  it('should have the correct servers in each location', () => {
    locations.forEach(location => {
      location.servers.forEach(server => {
        expect(server.country_name).toEqual(location.name)
      })
    })
  })
})
