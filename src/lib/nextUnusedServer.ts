import type { IMullvadServerWireguard } from '@/types/MullvadServer'

/** How servers are grouped when deciding whether a location has been used. */
export type DedupeBy = 'city' | 'relay'

export interface NextUnusedServer {
  server: IMullvadServerWireguard
  used: string[]
}

/** Pick a random server from a location that has not been used yet.
 *
 * A random unused location is picked first, then a random server within that
 * location. When deduping by city the location is the city; when deduping by
 * relay the location is a single relay. Once every location in the pool has
 * been used the pool's keys start over, beginning a new cycle with the picked
 * location.
 *
 * @param servers Servers to pick from.
 * @param used Used location keys, as returned by the previous call.
 * @param dedupeBy Whether a location is a city or a relay.
 * @returns The picked server and the updated used location list, or `undefined` if there are no servers.
 */
export function nextUnusedServer (servers: IMullvadServerWireguard[], used: string[], dedupeBy: DedupeBy = 'city'): NextUnusedServer | undefined {
  if (servers.length === 0) {
    return undefined
  }

  const key = dedupeBy === 'relay' ? relayKey : cityKey
  const unused = servers.filter(server => !used.includes(key(server)))
  const reset = unused.length === 0
  const pool = reset ? servers : unused
  const locations = [...new Set(pool.map(key))]
  const location = locations[Math.floor(Math.random() * locations.length)]
  const options = pool.filter(server => key(server) === location)
  const server = options[Math.floor(Math.random() * options.length)]
  const poolKeys = new Set(servers.map(key))

  return {
    server,
    used: reset
      ? [...used.filter(usedKey => !poolKeys.has(usedKey)), location]
      : [...used, location]
  }
}

/** The key used to dedupe servers by city.
 *
 * @param server Server to create a key for.
 * @returns The country and city codes of the server.
 */
function cityKey (server: IMullvadServerWireguard): string {
  return `${server.country_code}-${server.city_code}`
}

/** The key used to dedupe servers by relay.
 *
 * @param server Server to create a key for.
 * @returns The hostname of the server.
 */
function relayKey (server: IMullvadServerWireguard): string {
  return server.hostname
}
