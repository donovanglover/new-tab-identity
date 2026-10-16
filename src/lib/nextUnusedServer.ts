import type { IMullvadServerWireguard } from '@/types/MullvadServer'

export interface NextUnusedServer {
  server: IMullvadServerWireguard
  usedCities: string[]
}

/** Pick a random server from a city that has not been used yet.
 *
 * A random unused city is picked first, then a random server within that city.
 * Once every city has been used the city list starts over, beginning a new
 * cycle with the picked server's city.
 *
 * @param servers Servers to pick from.
 * @param usedCities Cities that have already been used, as returned by the previous call.
 * @returns The picked server and the updated used city list, or `undefined` if there are no servers.
 */
export function nextUnusedServer (servers: IMullvadServerWireguard[], usedCities: string[]): NextUnusedServer | undefined {
  if (servers.length === 0) {
    return undefined
  }

  const unused = servers.filter(server => !usedCities.includes(cityKey(server)))
  const reset = unused.length === 0
  const pool = reset ? servers : unused
  const cities = [...new Set(pool.map(cityKey))]
  const city = cities[Math.floor(Math.random() * cities.length)]
  const options = pool.filter(server => cityKey(server) === city)
  const server = options[Math.floor(Math.random() * options.length)]

  return {
    server,
    usedCities: reset ? [city] : [...usedCities, city]
  }
}

/** A unique key for the city a server is located in.
 *
 * @param server Server to create a key for.
 * @returns The country and city codes of the server.
 */
function cityKey (server: IMullvadServerWireguard): string {
  return `${server.country_code}-${server.city_code}`
}
