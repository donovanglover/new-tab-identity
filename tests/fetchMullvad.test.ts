import { describe, expect, it } from 'vitest'
import { fetchMullvad } from '../src/lib/fetchMullvad'

describe('fetchMullvad()', async () => {
  const servers = await fetchMullvad()

  it('should fetch the mullvad api successfully', () => {
    expect(servers).toBeDefined()
  })

  it('should only return wireguard servers', () => {
    servers.forEach(server => {
      expect(server).toHaveProperty('type', 'wireguard')
    })
  })

  it('should return the hostname for servers', () => {
    servers.forEach(server => {
      expect(server).toHaveProperty('hostname')
    })
  })

  it('should return the country_code for servers', () => {
    servers.forEach(server => {
      expect(server).toHaveProperty('country_code')
    })
  })

  it('should return the country_name for servers', () => {
    servers.forEach(server => {
      expect(server).toHaveProperty('country_name')
    })
  })

  it('should return the city_code for servers', () => {
    servers.forEach(server => {
      expect(server).toHaveProperty('city_code')
    })
  })

  it('should return the city_name for servers', () => {
    servers.forEach(server => {
      expect(server).toHaveProperty('city_name')
    })
  })

  it('should return the socks_name for servers', () => {
    servers.forEach(server => {
      expect(server).toHaveProperty('socks_name')
    })
  })

  it('should return the fqdn for servers', () => {
    servers.forEach(server => {
      expect(server).toHaveProperty('fqdn')
    })
  })

  it('should return the active state for servers', () => {
    servers.forEach(server => {
      expect(server).toHaveProperty('active')
    })
  })

  it('should return the owned state for servers', () => {
    servers.forEach(server => {
      expect(server).toHaveProperty('owned')
    })
  })

  it('should return the provider for servers', () => {
    servers.forEach(server => {
      expect(server).toHaveProperty('provider')
    })
  })

  it('should return the ipv4_addr_in for servers', () => {
    servers.forEach(server => {
      expect(server).toHaveProperty('ipv4_addr_in')
    })
  })

  it('should return the ipv6_addr_in for servers', () => {
    servers.forEach(server => {
      expect(server).toHaveProperty('ipv6_addr_in')
    })
  })

  it('should return the network_port_speed for servers', () => {
    servers.forEach(server => {
      expect(server).toHaveProperty('network_port_speed')
    })
  })

  it('should return the stboot for servers', () => {
    servers.forEach(server => {
      expect(server).toHaveProperty('stboot')
    })
  })

  it('should return the multihop_port for servers', () => {
    servers.forEach(server => {
      expect(server).toHaveProperty('multihop_port')
    })
  })

  it('should return the status_messages for servers', () => {
    servers.forEach(server => {
      expect(server).toHaveProperty('status_messages')
    })
  })

  describe('socks_name', () => {
    it('should start with the hostname with socks5 added', () => {
      servers.forEach(server => {
        expect(server.socks_name.startsWith(`${server.hostname.replace('-wg-', '-wg-socks5-')}`)).toBeTruthy()
      })
    })

    it('should end with .relays.mullvad.net', () => {
      servers.forEach(server => {
        expect(server.socks_name.endsWith('.relays.mullvad.net')).toBeTruthy()
      })
    })

    it('should equal $HOSTNAME with socks5 added + ".relays.mullvad.net"', () => {
      servers.forEach(server => {
        expect(server.socks_name).toEqual(`${server.hostname.replace('-wg-', '-wg-socks5-')}.relays.mullvad.net`)
      })
    })
  })

  describe('active', () => {
    it('should not return servers that are inactive', () => {
      servers.forEach(server => {
        expect(server.active).toBeTruthy()
      })
    })
  })
})
