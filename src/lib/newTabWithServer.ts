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
  name?: string
}

/** Sanitize a user-provided identity name while it is being typed.
 *
 * Commas are reserved for auto-generated names and parentheses are reserved
 * for the hostname suffix, so both are removed. Unlike
 * {@link sanitizeIdentityName}, surrounding whitespace is kept so spaces
 * survive between keystrokes when typing a multi-word name.
 *
 * @param name Identity name typed by the user.
 * @returns The sanitized name, capped at 20 characters, which may be empty.
 */
export function sanitizeIdentityNameInput (name: string): string {
  return name.replace(/[(),]/g, '').slice(0, 20)
}

/** Sanitize a user-provided identity name for use in a container name.
 *
 * Commas are reserved for auto-generated names and parentheses are reserved
 * for the hostname suffix, so both are removed.
 *
 * @param name Identity name typed by the user.
 * @returns The sanitized name, capped at 20 characters, which may be empty.
 */
export function sanitizeIdentityName (name: string): string {
  return name.replace(/[(),]/g, '').trim().slice(0, 20)
}

export async function newTabWithServer (server: IMullvadServerWireguard, options: Options = {}): Promise<browser.tabs.Tab> {
  const name = sanitizeIdentityName(options.name ?? '')

  const container = await browser.contextualIdentities.create({
    name: name === '' ? `${server.city_name}, ${server.country_name} (${server.hostname})` : `${name} (${server.hostname})`,
    color: colors[Math.floor(Math.random() * colors.length)],
    icon: icons[Math.floor(Math.random() * icons.length)]
  })

  const properties: Parameters<typeof browser.tabs.create>[0] = {
    cookieStoreId: container.cookieStoreId
  }

  if (options.url !== undefined) {
    properties.url = options.url
  }

  const tab = await browser.tabs.create(properties)

  return tab
}
