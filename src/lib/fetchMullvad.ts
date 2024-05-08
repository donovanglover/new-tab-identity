import { type IMullvadServerWireguard, isWireguard, type MullvadServer } from '@/types/MullvadServer'

/** The publicly accessible API endpoint used to fetch all Mullvad VPN servers.
 *
 * Note that the list only includes `active` servers so users won't have the
 * option to choose a server that doesn't work.
 *
 * Used for <https://mullvad.net/servers>.
 *
 * @returns A **randomized** list of `active` Wireguard Mullvad servers
 */
export async function fetchMullvad (): Promise<IMullvadServerWireguard[]> {
  const response = await fetch('https://api-www.mullvad.net/www/relays/all')
  const json: MullvadServer[] = await response.json()
  const wireguard = json.filter(isWireguard)
  const active = wireguard.filter(wireguard => wireguard.active)

  shuffle(active)

  return active
}

/** Shuffle an array unbiasedly.
 *
 * See: <https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle>
 */
function shuffle (array: any[]): void {
  let currentIndex = array.length

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
  }
}
