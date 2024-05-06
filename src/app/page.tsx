import { useEffect, useState } from 'react'
import Button from '../components/Button'
import { BrowserContainers } from '../lib/BrowserContainers'
import { fetchJSON } from '../lib/fetchJSON'
import { MULLVAD_PUBLIC_API_URL } from '../lib/globals'
import type { IMullvadServerWireguard, MullvadServer } from '../types/MullvadServer'

function updateServerList (): void {
  const containers = new BrowserContainers()

  fetchJSON(MULLVAD_PUBLIC_API_URL).then(result => {
    const servers: MullvadServer[] = result
    const relays = servers.filter(server => server.type === 'wireguard') as IMullvadServerWireguard[]

    for (const server of relays) {
      void containers.add(server.socks_name)
    }
  }).catch(e => { console.warn(e) })
}

export default function RootPage (): React.ReactElement {
  const [containers, setContainers] = useState<browser.contextualIdentities.ContextualIdentity[]>()

  useEffect(() => {
    browser.contextualIdentities.query({}).then((containers) => {
      setContainers(containers)
    }).catch(e => { console.warn(e) })
  }, [containers])

  function deleteContainer (): void {}

  return (
    <div className="p-4">
      <h1 className='text-center text-4xl font-bold'>New Tab Identity</h1>

      <Button onClick={updateServerList}>Update server list</Button>

      {browser.contextualIdentities === undefined
        ? <p>Go to <code>about:config</code> and set <code>privacy.userContext.enabled</code> to <code>true</code>, then restart your browser.</p>
        : <p>All good to go.</p>
      }

      {containers?.map(container => {
        return (
          <p style={{ color: container.colorCode }} key={container.cookieStoreId}>
            <span>({container.cookieStoreId.replace('firefox-container-', '')})</span>
            {' '}
            {container.name}
            <Button onClick={deleteContainer}>Delete</Button>
          </p>
        )
      })}
    </div>
  )
}
