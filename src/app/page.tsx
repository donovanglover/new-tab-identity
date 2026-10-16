import { useEffect, useRef, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { LuChevronDown, LuRefreshCw, LuX } from 'react-icons/lu'
import Button from '@/components/Button'
import CityButton from '@/components/CityButton'
import { fetchMullvad } from '@/lib/fetchMullvad'
import { filterByLocation, type ServerCountry } from '@/lib/filterByLocation'
import { newTabWithServer } from '@/lib/newTabWithServer'
import type { IMullvadServerWireguard } from '@/types/MullvadServer'
import type { StorageLocal } from '@/types/StorageAll'

async function updateServerList (): Promise<void> {
  if (Date.now() - (await browser.storage.local.get('lastUpdated') as Pick<StorageLocal, 'lastUpdated'>).lastUpdated > 60 * 1000) {
    const loading = toast.loading('Updating server list...')
    const servers = await fetchMullvad()

    await browser.storage.local.set({
      servers,
      lastUpdated: Date.now()
    })

    toast.dismiss(loading)
    toast.success(`Updated server list with ${servers.length} ${servers.length === 1 ? 'server' : 'servers'}.`)

    return
  }

  toast.error('Server list is already up to date!')
}

async function addTabWithServers (servers: IMullvadServerWireguard[]): Promise<void> {
  const randomServer = servers[Math.floor(Math.random() * servers.length)]

  await newTabWithServer(randomServer)

  window.close()
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

  toast.success(`Removed ${numRemoved} inactive ${numRemoved === 1 ? 'container' : 'containers'}.`)
}

export default function RootPage (): React.ReactElement {
  const [countries, setCountries] = useState<ServerCountry[]>([])
  const [openCountry, setOpenCountry] = useState<string | null>(null)
  const lastPointerType = useRef<string | null>(null)

  useEffect(() => {
    void browser.storage.local.get('servers').then(result => {
      setCountries(filterByLocation((result as Pick<StorageLocal, 'servers'>).servers))
    })
  }, [])

  function handleCountryClick (country: ServerCountry, hasCities: boolean, open: boolean): void {
    const pointerType = lastPointerType.current
    lastPointerType.current = null

    if (hasCities && pointerType === 'touch' && !open) {
      setOpenCountry(country.name)

      return
    }

    void addTabWithServers(country.cities.flatMap(city => city.servers))
  }

  function handleCellKeyDown (event: React.KeyboardEvent<HTMLDivElement>): void {
    lastPointerType.current = null

    const buttons = Array.from(event.currentTarget.querySelectorAll('button'))
    const index = buttons.indexOf(event.target as HTMLButtonElement)

    if (index === -1 || buttons.length === 1) {
      return
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      if (index < buttons.length - 1) {
        event.preventDefault()
        buttons[index + 1].focus()
      }

      return
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      if (index > 0) {
        event.preventDefault()
        buttons[index - 1].focus()
      }

      return
    }

    if (event.key === 'Escape' && index > 0) {
      event.preventDefault()
      buttons[0].focus()
    }
  }

  return (
    <div>
      <h1 className='p-4 text-center text-4xl font-bold'>New Tab Identity</h1>

      <div className="absolute right-0 top-0 p-4">
        <Button onClick={updateServerList} title="Update server list"><LuRefreshCw /></Button>
        <Button className="ml-2" onClick={removeInactiveContainers} title="Delete inactive containers"><LuX /></Button>
      </div>

      {browser.contextualIdentities === undefined && <p className="p-4"><strong className="text-orange">WARNING:</strong> Go to <code className="text-cyan">about:config</code> and set <code className="text-blue">privacy.userContext.enabled</code> to <code className="text-red">true</code>, then restart your browser. Otherwise this extension will not work!</p>}

      <div className="mx-0.5 grid grid-cols-4">
        {countries.map(country => {
          const hasCities = country.cities.length > 1
          const open = openCountry === country.name

          return (
            <div key={country.name} className="group relative p-0.5" onPointerDown={event => { lastPointerType.current = event.pointerType }} onKeyDown={handleCellKeyDown}>
              <Button className='w-full' onClick={() => handleCountryClick(country, hasCities, open)} title={country.name}>{country.name}{hasCities && <LuChevronDown className='ml-1 inline' />}</Button>

              {hasCities && (
                <div className={`absolute left-0.5 right-0.5 top-full z-10 flex-wrap justify-center gap-1 rounded-md border-2 border-300 bg-100 p-1 shadow-md ${open ? 'flex' : 'hidden group-hover:flex group-focus-within:flex'}`}>
                  {country.cities.map(city => {
                    return (
                      <CityButton key={city.name} onClick={() => addTabWithServers(city.servers)} tabIndex={-1} title={city.name}>{city.name}</CityButton>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <Toaster />
    </div>
  )
}
