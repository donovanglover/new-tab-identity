import { BrowserContainers } from '../lib/BrowserContainers'
import { fetchJSON } from '../lib/fetchJSON'
import { MULLVAD_PUBLIC_API_URL } from '../lib/globals'
import type { MullvadServer } from '../types/MullvadServer'
import Button from './ui/Button'

function updateServerList (): void {
  const containers = new BrowserContainers()

  fetchJSON(MULLVAD_PUBLIC_API_URL).then(result => {
    const servers: MullvadServer[] = result

    for (const server of servers) {
      const socks = server.socks_name

      if (socks !== undefined) {
        containers.add(socks).then(result => {
          console.log(result)
        }).catch(e => {
          console.warn(e)
        })
      }
    }
  }).catch(e => {
    console.warn(e)
  })
}

export default function UpdateServerList (): React.ReactElement {
  return (
    <Button onClick={updateServerList}>Update server list</Button>
  )
}
