import { useEffect, useRef, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { LuChevronDown, LuRefreshCw, LuX } from 'react-icons/lu'
import Button from '@/components/Button'
import CityButton from '@/components/CityButton'
import { countryFlag } from '@/lib/countryFlag'
import { fetchMullvad } from '@/lib/fetchMullvad'
import { filterByLocation, type ServerCountry } from '@/lib/filterByLocation'
import { countIdentities, formatIdentityCounts, type IdentityCounts } from '@/lib/identityCounts'
import { identityParts } from '@/lib/identityParts'
import { isAutoContainer } from '@/lib/isAutoContainer'
import { newTabWithServer, sanitizeIdentityName } from '@/lib/newTabWithServer'
import { serverInLocation } from '@/lib/serverInLocation'
import type { IMullvadServerWireguard } from '@/types/MullvadServer'
import type { StoredLocation, StorageLocal, StorageSync } from '@/types/StorageAll'

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

  toast.success('Server list is already up to date.')
}

async function addTabWithServers (servers: IMullvadServerWireguard[], name: string): Promise<void> {
  const randomServer = servers[Math.floor(Math.random() * servers.length)]

  await newTabWithServer(randomServer, { name })

  window.close()
}

async function getUsedCookieStoreIds (): Promise<Set<string>> {
  const tabs = await browser.tabs.query({})

  return new Set(tabs.map(tab => tab.cookieStoreId).filter((id): id is string => id !== undefined))
}

interface Identities {
  counts: IdentityCounts
  named: browser.contextualIdentities.ContextualIdentity[]
  usedCookieStoreIds: Set<string>
}

async function fetchIdentities (): Promise<Identities> {
  const containers = await browser.contextualIdentities.query({})
  const usedCookieStoreIds = await getUsedCookieStoreIds()

  return {
    counts: countIdentities(containers, usedCookieStoreIds),
    named: containers.filter(container => !isAutoContainer(container.name)),
    usedCookieStoreIds
  }
}

async function removeInactiveContainers (): Promise<void> {
  const containers = await browser.contextualIdentities.query({})
  const usedCookieStoreIds = await getUsedCookieStoreIds()
  let numRemoved = 0

  for (const container of containers) {
    if (!isAutoContainer(container.name) || usedCookieStoreIds.has(container.cookieStoreId)) {
      continue
    }

    await browser.contextualIdentities.remove(container.cookieStoreId)
    numRemoved++
  }

  toast.success(`Removed ${numRemoved} inactive ${numRemoved === 1 ? 'container' : 'containers'}.`)
}

export default function RootPage (): React.ReactElement {
  const [countries, setCountries] = useState<ServerCountry[]>([])
  const [identityName, setIdentityName] = useState('')
  const [settingCountry, setSettingCountry] = useState<StoredLocation | null>(null)
  const [settingCity, setSettingCity] = useState<StoredLocation | null>(null)
  const [identities, setIdentities] = useState<Identities>({
    counts: {
      custom: 0,
      random: 0,
      unused: 0
    },
    named: [],
    usedCookieStoreIds: new Set()
  })
  const [openCountry, setOpenCountry] = useState<string | null>(null)
  const lastPointerType = useRef<string | null>(null)

  useEffect(() => {
    void fetchIdentities().then(setIdentities)

    void browser.storage.local.get('servers').then(result => {
      setCountries(filterByLocation((result as Pick<StorageLocal, 'servers'>).servers))
    })

    void browser.storage.sync.get(['country', 'city']).then(result => {
      const settings = result as Pick<StorageSync, 'country' | 'city'>

      setSettingCountry(settings.country)
      setSettingCity(settings.city)
    })
  }, [])

  const sortedCountries = [...countries].sort((a, b) => a.name.localeCompare(b.name))
  const selectedCountry = countries.find(option => option.code === settingCountry?.code)
  const settingCities = selectedCountry?.cities ?? []
  const countryUnavailable = settingCountry !== null && selectedCountry === undefined
  const cityUnavailable = settingCity !== null && !settingCities.some(option => option.code === settingCity.code)

  const options = [{ value: '', label: '🌍 Any country' }]

  if (settingCountry !== null && countryUnavailable) {
    options.push({ value: settingCountry.code, label: `${countryFlag(settingCountry.code)} ${settingCountry.name}` })

    if (settingCity !== null) {
      options.push({ value: `${settingCountry.code}:${settingCity.code}`, label: `— ${settingCity.name}` })
    }
  }

  sortedCountries.forEach(country => {
    options.push({ value: country.code, label: `${countryFlag(country.code)} ${country.name}` })

    if (settingCity !== null && settingCountry?.code === country.code && cityUnavailable) {
      options.push({ value: `${country.code}:${settingCity.code}`, label: `— ${settingCity.name}` })
    }

    if (country.cities.length > 1) {
      const cities = [...country.cities].sort((a, b) => a.name.localeCompare(b.name))

      cities.forEach(city => {
        options.push({ value: `${country.code}:${city.code}`, label: `— ${city.name}` })
      })
    }
  })

  const value = settingCity !== null && settingCountry !== null
    ? `${settingCountry.code}:${settingCity.code}`
    : settingCountry?.code ?? ''

  function handleLocationChange (event: React.ChangeEvent<HTMLSelectElement>): void {
    const [countryCode, cityCode] = event.target.value.split(':')
    const selected = countries.find(option => option.code === countryCode)

    if (selected === undefined) {
      setSettingCountry(null)
      setSettingCity(null)

      void browser.storage.sync.set({
        country: null,
        city: null
      })

      return
    }

    const nextCountry = { code: selected.code, name: selected.name }

    if (cityCode === undefined) {
      setSettingCountry(nextCountry)
      setSettingCity(null)

      void browser.storage.sync.set({
        country: nextCountry,
        city: null
      })

      return
    }

    const selectedCity = selected.cities.find(option => option.code === cityCode)

    if (selectedCity === undefined) {
      return
    }

    const nextCity = { code: selectedCity.code, name: selectedCity.name }

    setSettingCountry(nextCountry)
    setSettingCity(nextCity)

    void browser.storage.sync.set({
      country: nextCountry,
      city: nextCity
    })
  }

  function handleIdentityNameChange (event: React.ChangeEvent<HTMLInputElement>): void {
    setIdentityName(sanitizeIdentityName(event.target.value))
  }

  function handleOpen (event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault()

    const servers = countries.flatMap(country => country.cities.flatMap(city => city.servers))
    const pool = servers.filter(server => serverInLocation(server, settingCountry, settingCity))

    if (pool.length === 0) {
      toast.error('No servers available for the configured location.')

      return
    }

    void addTabWithServers(pool, identityName)
  }

  async function handleRemoveInactiveContainers (): Promise<void> {
    await removeInactiveContainers()
    setIdentities(await fetchIdentities())
  }

  async function saveIdentityName (identity: browser.contextualIdentities.ContextualIdentity, input: HTMLInputElement): Promise<void> {
    const { custom, hostname } = identityParts(identity.name)
    const name = sanitizeIdentityName(input.value)

    if (name === '' || name === custom) {
      input.value = custom

      return
    }

    await browser.contextualIdentities.update(identity.cookieStoreId, {
      name: hostname === undefined ? name : `${name} (${hostname})`
    })

    input.value = name

    toast.success(`Renamed identity to ${name}.`)

    setIdentities(await fetchIdentities())
  }

  async function removeIdentity (identity: browser.contextualIdentities.ContextualIdentity): Promise<void> {
    await browser.contextualIdentities.remove(identity.cookieStoreId)

    toast.success(`Removed ${identity.name}.`)

    setIdentities(await fetchIdentities())
  }

  function handleCountryClick (country: ServerCountry, hasCities: boolean, open: boolean): void {
    const pointerType = lastPointerType.current
    lastPointerType.current = null

    if (hasCities && pointerType === 'touch' && !open) {
      setOpenCountry(country.name)

      return
    }

    void addTabWithServers(country.cities.flatMap(city => city.servers), identityName)
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

      <p className='-mt-2 px-4 pb-4 text-center text-sm text-600'>{formatIdentityCounts(identities.counts)}</p>

      <div className='flex flex-wrap items-start justify-center gap-2 px-4 pb-4'>
        <div className='flex flex-col gap-1'>
          <label className='text-sm text-600' htmlFor='location'>Default location</label>

          <select id='location' className='w-48 rounded-md border-2 border-300 bg-200 p-2 shadow' value={value} onChange={handleLocationChange}>
            {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>

        <form className='flex flex-col gap-1' onSubmit={handleOpen}>
          <label className='text-sm text-600' htmlFor='identity-name'>Identity name</label>

          <input id='identity-name' className='rounded-md border-2 border-300 bg-200 p-2 shadow' maxLength={20} placeholder='Name (optional)' value={identityName} onChange={handleIdentityNameChange} />
        </form>
      </div>

      <div className="absolute right-0 top-0 p-4">
        <Button onClick={updateServerList} title="Update server list"><LuRefreshCw /></Button>
        <Button className="ml-2" onClick={handleRemoveInactiveContainers} title="Delete inactive containers"><LuX /></Button>
      </div>

      {browser.contextualIdentities === undefined && <p className="p-4"><strong className="text-orange">WARNING:</strong> Go to <code className="text-cyan">about:config</code> and set <code className="text-blue">privacy.userContext.enabled</code> to <code className="text-red">true</code>, then restart your browser. Otherwise this extension will not work!</p>}

      <div className="mx-0.5 grid grid-cols-4">
        {countries.map(country => {
          const hasCities = country.cities.length > 1
          const open = openCountry === country.name

          return (
            <div key={country.name} className="group relative p-0.5" onPointerDown={event => { lastPointerType.current = event.pointerType }} onKeyDown={handleCellKeyDown}>
              <Button className='w-full' onClick={() => handleCountryClick(country, hasCities, open)} title={country.name}><span aria-hidden='true'>{countryFlag(country.code)}</span> {country.name}{hasCities && <LuChevronDown className='ml-1 inline' />}</Button>

              {hasCities && (
                <div className={`absolute left-0.5 right-0.5 top-full z-10 flex-wrap justify-center gap-1 rounded-md border-2 border-300 bg-100 p-1 shadow-md ${open ? 'flex' : 'hidden group-hover:flex group-focus-within:flex'}`}>
                  {country.cities.map(city => {
                    return (
                      <CityButton key={city.name} onClick={() => addTabWithServers(city.servers, identityName)} tabIndex={-1} title={city.name}>{city.name}</CityButton>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {identities.named.length > 0 && (
        <div className='p-4'>
          <h2 className='pb-2 text-sm text-600'>Custom identities</h2>

          <div className='flex flex-col gap-1'>
            {identities.named.map(identity => {
              const { custom, hostname } = identityParts(identity.name)
              const used = identities.usedCookieStoreIds.has(identity.cookieStoreId)

              return (
                <div key={identity.cookieStoreId} className='flex items-center gap-2'>
                  <input aria-label='Identity name' className='min-w-0 flex-1 rounded-md border-2 border-300 bg-200 p-2 shadow' defaultValue={custom} maxLength={20} onChange={event => { event.target.value = sanitizeIdentityName(event.target.value) }} onBlur={event => { void saveIdentityName(identity, event.target) }} onKeyDown={event => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      void saveIdentityName(identity, event.currentTarget)
                    }
                  }} />

                  {hostname !== undefined && <span className='shrink-0 text-xs text-600'>({hostname})</span>}

                  <Button className='shrink-0' disabled={used} onClick={() => { void removeIdentity(identity) }} title={used ? 'Close its tabs first' : 'Delete identity'}><LuX /></Button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <Toaster />
    </div>
  )
}
