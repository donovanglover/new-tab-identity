import type { MullvadServer } from '../providers/Mullvad'

const browser = window.browser
const colors = ['blue', 'turquoise', 'green', 'yellow', 'orange', 'red', 'pink', 'purple', 'toolbar']

/** The publicly accessible API endpoint used to fetch all Mullvad VPN servers.
 *
 * Used for <https://mullvad.net/servers>.
 */
export const MULLVAD_PUBLIC_API_URL = 'https://api-www.mullvad.net/www/relays/all'

// Remove all existing containers
browser.contextualIdentities.query({}).then(async contexts => {
  for (const context of contexts) {
    await browser.contextualIdentities.remove(context.cookieStoreId)
  }

  // Add containers based on Mullvad API
  const servers: MullvadServer[] = await (await fetch(MULLVAD_PUBLIC_API_URL)).json()

  for (const [i, server] of servers.entries()) {
    const socks = server.socks_name

    if (socks !== undefined) {
      await browser.contextualIdentities.create({
        name: socks,
        color: colors[i % colors.length],
        icon: 'circle'
      })
    }
  }
}).catch(err => {
  console.log(err)
})

// Listen for requests and proxy based on container
browser.proxy.onRequest.addListener(requestInfo => {
  const id = requestInfo.cookieStoreId
  if (typeof id === 'undefined' || id === 'firefox-default') {
    return
  }

  return {
    type: 'socks',
    host: browser.contextualIdentities.get(id).then(context => {
      return context.name
    }),

    proxyDNS: true,
    port: 1080
  }
}, { urls: ['<all_urls>'] })

browser.proxy.onError.addListener(error => {
  console.error(`Proxy error: ${error.message}`)
})
