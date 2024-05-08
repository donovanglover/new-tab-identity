import type { IMullvadServerWireguard } from '@/types/MullvadServer'

const colors = [
  'blue',
  'turquoise',
  'green',
  'yellow',
  'orange',
  'red',
  'pink',
  'purple'
]

const icons = [
  'fingerprint',
  'briefcase',
  'dollar',
  'cart',
  'circle',
  'gift',
  'vacation',
  'food',
  'fruit',
  'pet',
  'tree',
  'chill',
  'fence'
]

interface Options {
  url?: string
}

export async function newTabWithServer (server: IMullvadServerWireguard, options: Options = {}): Promise<browser.tabs.Tab> {
  const container = await browser.contextualIdentities.create({
    name: `${server.city_name}, ${server.country_name} (${server.hostname})`,
    color: colors[Math.floor(Math.random() * colors.length)],
    icon: icons[Math.floor(Math.random() * icons.length)]
  })

  const tab = await browser.tabs.create({
    url: options.url ?? 'https://am.i.mullvad.net/connected',
    cookieStoreId: container.cookieStoreId
  })

  return tab
}
