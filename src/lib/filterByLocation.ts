import type { IMullvadServerWireguard } from '@/types/MullvadServer'

export interface ServerCity {
  name: string
  servers: IMullvadServerWireguard[]
}

export interface ServerCountry {
  name: string
  cities: ServerCity[]
}

/** Group servers by country, then by city within each country.
 *
 * @param servers Servers to group.
 * @returns Countries in order of first appearance, each with its cities in order of first appearance.
 */
export function filterByLocation (servers: IMullvadServerWireguard[]): ServerCountry[] {
  const countries: ServerCountry[] = []

  servers.forEach(server => {
    let country = countries.find(country => country.name === server.country_name)

    if (country === undefined) {
      country = {
        name: server.country_name,
        cities: []
      }

      countries.push(country)
    }

    const city = country.cities.find(city => city.name === server.city_name)

    if (city !== undefined) {
      city.servers.push(server)

      return
    }

    country.cities.push({
      name: server.city_name,
      servers: [server]
    })
  })

  return countries
}
