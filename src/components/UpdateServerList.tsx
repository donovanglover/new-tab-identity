import { BrowserContainers } from '../lib/BrowserContainers'
import { fetchJSON } from '../lib/fetchJSON'
import { MULLVAD_PUBLIC_API_URL } from '../lib/globals'
import type { MullvadServer } from '../types/MullvadServer'
import Button from './ui/Button'

async function updateServerList (): Promise<void> {
  const containers = new BrowserContainers()
  const servers: MullvadServer[] = await fetchJSON(MULLVAD_PUBLIC_API_URL)

  for (const server of servers) {
    const socks = server.socks_name

    if (socks !== undefined) {
      await containers.add(socks)
    }
  }
}

export default function UpdateServerList (): React.ReactElement {
  return (
    <Button onClick={() => { void updateServerList() }}>Update server list</Button>
  )
}
