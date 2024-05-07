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

  it('should return the socks_name for servers', () => {
    servers.forEach(server => {
      expect(server).toHaveProperty('socks_name')
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
})
