/** Server data returned from the publicly accessible Mullvad API.
 *
 * Date last checked for changes in public API: 2024-04-30.
 */
interface IMullvadServer {
  /** The hostname of the server.
   *
   * This is the part before ".relays.mullvad.net" in the *fqdn*.
   *
   * @example "us-slc-wg-106"
   */
  hostname: string

  /** The English locale country code for a given server.
   *
   * @example "us"
   */
  country_code: string

  /** The English locale country name for a given server.
   *
   * @example "USA"
   */
  country_name: string

  /** The English locale city code for a given server.
   *
   * @example "slc"
   */
  city_code: string

  /** The English locale city name for a given server.
   *
   * @example "Salt Lake City, UT"
   */
  city_name: string

  /** The fully qualified domain name for the given server.
   *
   * Unlike `socks_name`, this also includes OpenVPN `-ovpn-` servers
   * and bridge `-br-` servers.
   *
   * @example "us-slc-wg-106.relays.mullvad.net"
   * @example "us-lax-ovpn-403.relays.mullvad.net"
   * @example "ch-zrh-br-001.relays.mullvad.net"
   */
  fqdn: `${string}.relays.mullvad.net`

  /** Whether or not the server is currently accessible.
   *
   * If `false`, you should **not** let the user use that server since it won't work.
   *
   * @example true
   */
  active: boolean

  /** Whether or not the server is owned by Mullvad.
   *
   * If `false`, then the server is being rented.
   *
   * @example false
   */
  owned: boolean

  /** The provider Mullvad is doing business with.
   *
   * @example "100TB"
   */
  provider: string

  /** The IPv4 address you connect to in order to use the server.
   *
   * Websites will see a similar IP address, except with a different last number.
   *
   * DNS requests should originate from this address.
   *
   * @example "69.4.234.142"
   */
  ipv4_addr_in: string

  /** The IPv6 address you connect to in order to use the server.
   *
   * Websites will see a similar IP address, except with the last set of characters being different.
   *
   * This should return `null` for servers of *type* `bridge`.
   *
   * @example "2606:2e00:0:b9::f501"
   * @example "2001:ac8:84:3::1f"
   */
  ipv6_addr_in: string | null

  /** How fast the server is, measured in Gbps.
   *
   * This can be used to only offer high-speed servers to the user.
   *
   * Note that there are currently 4 different speeds, although more may
   * be added or removed in the future.
   *
   * @example 10
   */
  network_port_speed: 1 | 10 | 20 | 40

  /** Whether or not the server uses Mullvad's stboot bootloader.
   *
   * This means that the server is RAM-only and diskless.
   *
   * <https://mullvad.net/en/blog/2022/1/12/diskless-infrastructure-beta-system-transparency-stboot>
   * <https://mullvad.net/en/blog/expanding-diskless-infrastructure-to-more-locations-system-transparency-stboot>
   * <https://mullvad.net/en/blog/2023/9/20/we-have-successfully-completed-our-migration-to-ram-only-vpn-infrastructure>
   *
   * As of September 2023, all servers should be RAM-only.
   *
   * @example true
   */
  stboot: true

  /** The port used for multi-hopping.
   *
   * @example 3295
   */
  multihop_port?: number

  /** What type of connection the given server is.
   *
   * @example "wireguard"
   */
  type: string

  /** An array of status messages for the given server.
   *
   * If there are no messages, an empty array is returned instead.
   *
   * @example []
   * @example [{ message: "1 and 2Gbps servers hosted by Tzulo will be upgraded to 10Gbps, keep in mind IP-addresses will change, as will WireGuard pubkeys for those servers. Please use other servers during this time to minimize downtime." }]
   */
  status_messages: MullvadStatusMessage[]
}

/** A status message for a Mullvad server.
 *
 * @example { message: "1 and 2Gbps servers hosted by Tzulo will be upgraded to 10Gbps, keep in mind IP-addresses will change, as will WireGuard pubkeys for those servers. Please use other servers during this time to minimize downtime." }
 */
export interface MullvadStatusMessage {
  /** A string consisting of a message about the server.
   *
   * @example "1 and 2Gbps servers hosted by Tzulo will be upgraded to 10Gbps, keep in mind IP-addresses will change, as will WireGuard pubkeys for those servers. Please use other servers during this time to minimize downtime."
   */
  message: string
}

export interface IMullvadServerWireguard extends IMullvadServer {
  type: 'wireguard'

  /** The public key to access the server.
   *
   * @example "abx3jjkKD+7abroGzeELm4Esa4bESJV72Fm9Tp+YqAE="
   */
  pubkey: string

  /** The name of the SOCKS5 relay to connect to.
   *
   * @example "us-slc-wg-socks5-106.relays.mullvad.net"
   */
  socks_name: `${string}.relays.mullvad.net`

  /** The port to access the SOCKS5 proxy.
   *
   * This is currently port 1080 for all connections.
   *
   * <https://mullvad.net/en/help/socks5-proxy>
   *
   * @example 1080
   */
  socks_port: 1080

  /** Whether or not the relay supports DAITA.
   *
   * DAITA stands for "Defense against AI-guided Traffic Analysis".
   *
   * "DAITA hides patterns in your encrypted VPN traffic. If anyone is monitoring
   * your connection, this makes it significantly harder for them to identify what
   * websites you are visiting. It does this by carefully adding network noise and
   * making all network packets the same size."
   *
   * This seems to be an unreleased feature; no servers currently support DAITA.
   *
   * <https://github.com/mullvad/mullvadvpn-app/blob/0eb0832/gui/locales/messages.pot#L1999>
   *
   * @example false
   */
  daita: boolean
}

interface IMullvadServerBridge extends IMullvadServer {
  type: 'bridge'

  /** The v2Ray IP address for a given server.
   *
   * The last set of numbers should be different than *ipv4_addr_in*.
   *
   * <https://www.v2ray.com/en/index.html>
   * <https://github.com/v2fly/v2ray-core>
   *
   * @example "146.70.141.155"
   */
  ipv4_v2ray: string

  /** The SSH fingerprint in SHA256 for the v2Ray server.
   *
   * @example "SHA256:wEmga6H8w6oCOz8s8YGzQs2WaGSPTFBEydyLuCAgHnE"
   */
  ssh_fingerprint_sha256: `SHA256:${string}`

  /** The SSH fingerprint in MD5 for the v2Ray server.
   *
   * @example "MD5:57:33:cb:32:c5:01:df…0b:ad:e7:b7:3a:98:9f:68"
   */
  ssh_fingerprint_md5: `MD5:${string}`
}

interface IMullvadServerOpenVpn extends IMullvadServer {
  type: 'openvpn'
}

export type MullvadServer = IMullvadServerWireguard | IMullvadServerBridge | IMullvadServerOpenVpn
