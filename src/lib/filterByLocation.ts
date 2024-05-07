import type { MullvadServer } from '../types/MullvadServer'

export interface ServerLocation {
  name: string
  servers: MullvadServer[]
}

export function filterByLocation (servers: MullvadServer[]): ServerLocation[] {
  const locations: ServerLocation[] = []

  servers.forEach(server => {
    const location = locations.find(location => location.name === server.country_name)

    if (location !== undefined) {
      location.servers.push(server)

      return
    }

    locations.push({
      name: server.country_name,
      servers: [server]
    })
  })

  return locations
}
