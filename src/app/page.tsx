import { useEffect, useState } from 'react'
import { LuRefreshCw, LuX } from 'react-icons/lu'
import Button from '../components/Button'
import { fetchMullvad } from '../lib/fetchMullvad'
import { filterByLocation, type ServerLocation } from '../lib/filterByLocation'
import { type StorageLocal } from '../types/StorageAll'

const colors = ['blue', 'turquoise', 'green', 'yellow', 'orange', 'red', 'pink', 'purple']
const containers: browser.contextualIdentities.ContextualIdentity[] = []

async function updateServerList (): Promise<void> {
  const servers = await fetchMullvad()

  for (const server of servers) {
    await addContainer(server.socks_name)
  }
}

async function addContainer (name: string): Promise<void> {
  const container = await browser.contextualIdentities.create({
    name,
    color: colors[containers.length % colors.length],
    icon: 'circle'
  })

  containers.push(container)
}

async function deleteContainer (): Promise<void> {
  const contexts = await browser.contextualIdentities.query({})

  for (const context of contexts) {
    await browser.contextualIdentities.remove(context.cookieStoreId)
  }
}

async function newTabWithContainer (cookieStoreId: string): Promise<void> {
  await browser.tabs.create({
    url: 'about:blank',
    cookieStoreId
  })
}

export default function RootPage (): React.ReactElement {
  const [locations, setLocations] = useState<ServerLocation[]>([])

  useEffect(() => {
    void browser.storage.local.get('servers').then(result => {
      setLocations(filterByLocation((result as Pick<StorageLocal, 'servers'>).servers))
    })
  }, [locations])

  return (
    <div>
      <h1 className='m-4 text-center text-4xl font-bold'>New Tab Identity</h1>

      <div className="absolute right-0 top-0 p-4">
        <Button onClick={updateServerList} title="Update server list"><LuRefreshCw /></Button>
        <Button className="ml-2" onClick={deleteContainer} title="Delete all containers"><LuX /></Button>
      </div>

      {browser.contextualIdentities === undefined
        ? <p>Go to <code>about:config</code> and set <code>privacy.userContext.enabled</code> to <code>true</code>, then restart your browser.</p>
        : <p>All good to go.</p>
      }

      <div className="grid grid-cols-4">
        {locations.map(location => {
          return (
            <div key={location.name} className='bg-pink'>{location.name}</div>
          )
        })}
      </div>
    </div>
  )
}
