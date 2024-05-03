import { ContainerList } from '../lib/browser'
import { type MullvadServer } from '../lib/Mullvad'
import Button from './Button'

async function updateServerList (): Promise<void> {
  const list = new ContainerList()
  const servers: MullvadServer[] = await browser.runtime.sendMessage({
    contentScriptQuery: 'fetch'
  })

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
