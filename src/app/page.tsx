import { useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { LuRefreshCw, LuX } from 'react-icons/lu'
import Button from '../components/Button'
import { fetchMullvad } from '../lib/fetchMullvad'
import { filterByLocation, type ServerLocation } from '../lib/filterByLocation'
import { type StorageLocal } from '../types/StorageAll'

const colors = ['blue', 'turquoise', 'green', 'yellow', 'orange', 'red', 'pink', 'purple']

async function updateServerList (): Promise<void> {
  if (Date.now() - (await browser.storage.local.get('lastUpdated') as Pick<StorageLocal, 'lastUpdated'>).lastUpdated > 60 * 1000) {
    const loading = toast.loading('Updating server list...')
    const servers = await fetchMullvad()

    await browser.storage.local.set({
      servers,
      lastUpdated: Date.now()
    })

    toast.dismiss(loading)
    toast.success(`Updated server list with ${servers.length} servers.`)

    return
  }

  toast.error('Server list is already up to date!')
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
  let numRemoved = 0

  for (const container of containers) {
    const tabsWithContainer = await browser.tabs.query({ cookieStoreId: container.cookieStoreId })

    if (tabsWithContainer.length === 0) {
      await browser.contextualIdentities.remove(container.cookieStoreId)
      numRemoved++
    }
  }

  toast.success(`Removed ${numRemoved} inactive containers.`)
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
      <h1 className='p-4 text-center text-4xl font-bold'>New Tab Identity</h1>

      <div className="absolute right-0 top-0 p-4">
        <Button onClick={updateServerList} title="Update server list"><LuRefreshCw /></Button>
        <Button className="ml-2" onClick={removeInactiveContainers} title="Delete all containers"><LuX /></Button>
      </div>

      {browser.contextualIdentities === undefined && <p className="p-4"><strong className="text-orange">WARNING:</strong> Go to <code className="text-cyan">about:config</code> and set <code className="text-blue">privacy.userContext.enabled</code> to <code className="text-red">true</code>, then restart your browser. Otherwise this extension will not work!</p>}

      <div className="grid grid-cols-4">
        {locations.map(location => {
          return (
            <Button key={location.name} className='bg-pink' onClick={addTabWithLocation} title={location.name}>{location.name}</Button>
          )
        })}
      </div>
      <Toaster />
    </div>
  )
}
