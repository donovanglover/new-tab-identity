import { type IMullvadServerWireguard, isWireguard } from '../types/MullvadServer'

/** The publicly accessible API endpoint used to fetch all Mullvad VPN servers.
 *
 * Used for <https://mullvad.net/servers>.
 */
export async function fetchMullvad (): Promise<IMullvadServerWireguard[]> {
  const response = await fetch('https://api-www.mullvad.net/www/relays/all')
  const json = await response.json()
  const wireguard = json.filter(isWireguard)

  return wireguard
}
