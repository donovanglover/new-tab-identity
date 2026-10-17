import { useEffect, useRef, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { LuArrowUpRight, LuChevronDown, LuLoaderCircle, LuPlus, LuRefreshCw, LuX } from 'react-icons/lu'
import Button from '@/components/Button'
import CityButton from '@/components/CityButton'
import { countryFlag } from '@/lib/countryFlag'
import { fetchMullvad } from '@/lib/fetchMullvad'
import { filterByLocation, type ServerCountry } from '@/lib/filterByLocation'
import { countIdentities, formatIdentityCounts, type IdentityCounts } from '@/lib/identityCounts'
import { identityParts } from '@/lib/identityParts'
import { isAutoContainer } from '@/lib/isAutoContainer'
import { isCustomIdentity } from '@/lib/isCustomIdentity'
import { newTabWithIdentity } from '@/lib/newTabWithIdentity'
import { newTabWithServer, sanitizeIdentityName } from '@/lib/newTabWithServer'
import { nextUnusedServer } from '@/lib/nextUnusedServer'
import { sanitizeNewTabUrl } from '@/lib/sanitizeNewTabUrl'
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

function randomServer (servers: IMullvadServerWireguard[]): IMullvadServerWireguard {
  return servers[Math.floor(Math.random() * servers.length)]
}

async function addTabWithServers (servers: IMullvadServerWireguard[], name: string): Promise<void> {
  await newTabWithServer(randomServer(servers), { name })

  window.close()
}

async function getUsedCookieStoreIds (): Promise<Set<string>> {
  const tabs = await browser.tabs.query({})
  const inProgress = await browser.downloads.search({ state: 'in_progress' })
  const interrupted = await browser.downloads.search({ state: 'interrupted' })
  const cookieStoreIds = [
    ...tabs.map(tab => tab.cookieStoreId),
    ...inProgress.map(download => download.cookieStoreId),
    ...interrupted.map(download => download.cookieStoreId)
  ]

  return new Set(cookieStoreIds.filter((id): id is string => id !== undefined))
}

interface Identities {
  counts: IdentityCounts
  customIdentities: browser.contextualIdentities.ContextualIdentity[]
  usedCookieStoreIds: Set<string>
  identityUrls: Record<string, string>
}

async function fetchIdentities (): Promise<Identities> {
  const containers = await browser.contextualIdentities.query({})
  const usedCookieStoreIds = await getUsedCookieStoreIds()
  const { identityUrls } = await browser.storage.local.get('identityUrls') as Pick<StorageLocal, 'identityUrls'>

  return {
    counts: countIdentities(containers, usedCookieStoreIds),
    customIdentities: containers.filter(container => isCustomIdentity(container.name)),
    usedCookieStoreIds,
    identityUrls: identityUrls ?? {}
  }
}

async function removeInactiveContainers (): Promise<void> {
  const loading = toast.loading('Deleting inactive containers...')

  try {
    const containers = await browser.contextualIdentities.query({})
    const usedCookieStoreIds = await getUsedCookieStoreIds()
    const removable = containers.filter(container => isAutoContainer(container.name) && !usedCookieStoreIds.has(container.cookieStoreId))
    const total = removable.length
    let numRemoved = 0
    let lastUpdate = Date.now()

    if (total > 0) {
      toast.loading(`Deleting inactive containers... 0/${total} (0%)`, { id: loading })
    }

    for (const container of removable) {
      await browser.contextualIdentities.remove(container.cookieStoreId)
      numRemoved++

      if (numRemoved === total || Date.now() - lastUpdate >= 250) {
        toast.loading(`Deleting inactive containers... ${numRemoved}/${total} (${Math.floor(numRemoved / total * 100)}%)`, { id: loading })
        lastUpdate = Date.now()
      }
    }

    toast.success(`Removed ${numRemoved} inactive ${numRemoved === 1 ? 'container' : 'containers'}.`, { id: loading })
  } catch {
    toast.error('Failed to delete inactive containers.', { id: loading })
  }
}

async function openRandomNewTab (): Promise<void> {
  const { servers, used, usedAt } = await browser.storage.local.get(['servers', 'used', 'usedAt']) as Pick<StorageLocal, 'servers' | 'used' | 'usedAt'>
  const now = Date.now()
  const expired = usedAt !== 0 && now - usedAt > 60 * 60 * 1000
  const next = nextUnusedServer(servers, expired ? [] : used)

  if (next === undefined) {
    toast.error('No servers available.')

    return
  }

  await browser.storage.local.set({
    used: next.used,
    usedAt: now
  })

  await newTabWithServer(next.server)

  window.close()
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
    customIdentities: [],
    usedCookieStoreIds: new Set(),
    identityUrls: {}
  })
  const [openCountry, setOpenCountry] = useState<string | null>(null)
  const [deletingInactive, setDeletingInactive] = useState(false)
  const [openingRandomTab, setOpeningRandomTab] = useState(false)
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
  const relays = countries.flatMap(country => country.cities.flatMap(city => city.servers))
  const cityOptions = sortedCountries.flatMap(country => {
    const cities = [...country.cities].sort((a, b) => a.name.localeCompare(b.name))

    return cities.map(city => ({
      value: `${country.code}:${city.code}`,
      label: `${countryFlag(country.code)} ${city.name}, ${country.name}`
    }))
  })

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

  async function handleOpenRandomTab (): Promise<void> {
    setOpeningRandomTab(true)

    try {
      await openRandomNewTab()
    } finally {
      setOpeningRandomTab(false)
    }
  }

  async function handleRemoveInactiveContainers (): Promise<void> {
    setDeletingInactive(true)

    try {
      await removeInactiveContainers()
      setIdentities(await fetchIdentities())
    } finally {
      setDeletingInactive(false)
    }
  }

  async function saveIdentityUrl (identity: browser.contextualIdentities.ContextualIdentity, input: HTMLInputElement): Promise<void> {
    const raw = input.value
    const url = sanitizeNewTabUrl(raw)

    if (url === undefined && raw.trim() !== '') {
      toast.error('Enter a valid URL.')
      input.value = identities.identityUrls[identity.cookieStoreId] ?? ''

      return
    }

    const current = identities.identityUrls[identity.cookieStoreId] ?? ''
    const nextUrl = url ?? ''

    if (nextUrl === current) {
      input.value = nextUrl

      return
    }

    const next = { ...identities.identityUrls }

    if (url === undefined) {
      delete next[identity.cookieStoreId]
    } else {
      next[identity.cookieStoreId] = url
    }

    setIdentities({ ...identities, identityUrls: next })
    await browser.storage.local.set({ identityUrls: next })

    input.value = nextUrl

    toast.success(url === undefined ? 'Reset new tab URL to the default.' : 'Updated new tab URL.')
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

    const next = { ...identities.identityUrls }
    delete next[identity.cookieStoreId]

    await browser.storage.local.set({ identityUrls: next })

    toast.success(`Removed ${identity.name}.`)

    setIdentities(await fetchIdentities())
  }

  async function openIdentityTab (identity: browser.contextualIdentities.ContextualIdentity): Promise<void> {
    await newTabWithIdentity(identity, identities.identityUrls[identity.cookieStoreId])

    window.close()
  }

  function handleIdentityServerChange (identity: browser.contextualIdentities.ContextualIdentity, event: React.ChangeEvent<HTMLSelectElement>): void {
    const [countryCode, cityCode] = event.currentTarget.value.split(':')

    if (cityCode === undefined) {
      return
    }

    const servers = relays.filter(server => server.country_code === countryCode && server.city_code === cityCode)

    if (servers.length === 0) {
      return
    }

    const server = randomServer(servers)
    const input = event.currentTarget.parentElement?.querySelector<HTMLInputElement>('input')
    const { custom } = identityParts(identity.name)
    const name = input === null || input === undefined ? custom : sanitizeIdentityName(input.value)

    void changeIdentityServer(identity, name === '' ? custom : name, server)
  }

  async function changeIdentityServer (identity: browser.contextualIdentities.ContextualIdentity, custom: string, server: IMullvadServerWireguard): Promise<void> {
    await browser.contextualIdentities.update(identity.cookieStoreId, {
      name: `${custom} (${server.hostname})`
    })

    toast.success(`Changed server to ${server.city_name}, ${server.country_name}.`)

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
        <Button className="mr-2" disabled={openingRandomTab} onClick={handleOpenRandomTab} title="Open random new tab"><LuPlus /></Button>
        <Button onClick={updateServerList} title="Update server list"><LuRefreshCw /></Button>
        <Button className="ml-2" disabled={deletingInactive} onClick={handleRemoveInactiveContainers} title={deletingInactive ? 'Deleting inactive containers...' : 'Delete inactive containers'}>{deletingInactive ? <LuLoaderCircle className='animate-spin' /> : <LuX />}</Button>
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

      {identities.customIdentities.length > 0 && (
        <div className='p-4'>
          <h2 className='pb-2 text-sm text-600'>Custom identities</h2>

          <div className='flex flex-col gap-1'>
            {identities.customIdentities.map(identity => {
              const { custom, hostname } = identityParts(identity.name)
              const used = identities.usedCookieStoreIds.has(identity.cookieStoreId)
              const server = relays.find(option => option.hostname === hostname)

              return (
                <div key={identity.cookieStoreId} className='flex items-center gap-2'>
                  <input aria-label='Identity name' className='w-48 shrink-0 rounded-md border-2 border-300 bg-200 p-2 shadow' defaultValue={custom} maxLength={20} onChange={event => { event.target.value = sanitizeIdentityName(event.target.value) }} onBlur={event => { void saveIdentityName(identity, event.target) }} onKeyDown={event => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      void saveIdentityName(identity, event.currentTarget)
                    }
                  }} />

                  <input aria-label='New tab URL' className='min-w-0 flex-1 rounded-md border-2 border-300 bg-200 p-2 shadow' placeholder='Optional URL' defaultValue={identities.identityUrls[identity.cookieStoreId] ?? ''} onBlur={event => { void saveIdentityUrl(identity, event.target) }} onKeyDown={event => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      void saveIdentityUrl(identity, event.currentTarget)
                    }
                  }} />

                  <select aria-label='Server' className='w-64 shrink-0 rounded-md border-2 border-300 bg-200 p-2 shadow' value={server === undefined ? hostname ?? '' : `${server.country_code}:${server.city_code}`} onChange={event => { handleIdentityServerChange(identity, event) }}>
                    {server === undefined && hostname !== undefined && <option value={hostname}>{hostname}</option>}
                    {cityOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>

                  <Button className='shrink-0' onClick={() => { void openIdentityTab(identity) }} title='Open new tab'><LuArrowUpRight /></Button>

                  <Button className='shrink-0' disabled={used} onClick={() => { void removeIdentity(identity) }} title={used ? 'In use by tabs or downloads' : 'Delete identity'}><LuX /></Button>
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
