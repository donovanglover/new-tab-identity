import { ContainerList } from '../lib/browser'
import { fetchJSON } from '../lib/fetchJSON'
import { MULLVAD_PUBLIC_API_URL } from '../lib/globals'
import type { MullvadServer } from '../types/MullvadServer'
import Button from './Button'

async function updateServerList (): Promise<void> {
  const list = new ContainerList()
  const servers: MullvadServer[] = await fetchJSON(MULLVAD_PUBLIC_API_URL)

  console.log(list)
  console.log(servers)

  for (const server of servers) {
    const socks = server.socks_name

    if (socks !== undefined) {
      await list.add(socks)
    }
  }

  console.log(list)
}

export default function UpdateServerList (): React.ReactElement {
  return (
    <Button onClick={() => { void updateServerList() }}>Update server list</Button>
  )
}
