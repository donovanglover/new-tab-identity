import { useEffect, useState } from 'react'
import { LuRefreshCw, LuX } from 'react-icons/lu'
import Button from '../components/Button'
import { fetchMullvad } from '../lib/fetchMullvad'
import { filterByLocation, type ServerLocation } from '../lib/filterByLocation'
import { type StorageLocal } from '../types/StorageAll'

const colors = ['blue', 'turquoise', 'green', 'yellow', 'orange', 'red', 'pink', 'purple']

async function updateServerList (): Promise<void> {
  if (Date.now() - (await browser.storage.local.get('lastUpdated') as Pick<StorageLocal, 'lastUpdated'>).lastUpdated > 60 * 1000) {
    await browser.storage.local.set({
      servers: await fetchMullvad(),
      lastUpdated: Date.now()
    })
  }
}

let i = 0
async function addTabWithLocation (event: React.MouseEvent<HTMLElement>): Promise<void> {
  const container = await browser.contextualIdentities.create({
    name: (event.target as HTMLButtonElement).innerText,
    color: colors[i++ % colors.length],
    icon: 'circle'
  })

  await browser.tabs.create({
    url: 'about:blank',
    cookieStoreId: container.cookieStoreId
  })
}

async function removeInactiveContainers (): Promise<void> {
  const containers = await browser.contextualIdentities.query({})

  for (const container of containers) {
    const tabsWithContainer = await browser.tabs.query({ cookieStoreId: container.cookieStoreId })

    if (tabsWithContainer.length === 0) {
      await browser.contextualIdentities.remove(container.cookieStoreId)
    }
  }
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
        <Button className="ml-2" onClick={removeInactiveContainers} title="Delete all containers"><LuX /></Button>
      </div>

      {browser.contextualIdentities === undefined
        ? <p>Go to <code>about:config</code> and set <code>privacy.userContext.enabled</code> to <code>true</code>, then restart your browser.</p>
        : <p>All good to go.</p>
      }

      <div className="grid grid-cols-4">
        {locations.map(location => {
          return (
            <Button key={location.name} className='bg-pink' onClick={addTabWithLocation} title={location.name}>{location.name}</Button>
          )
        })}
      </div>
    </div>
  )
}
