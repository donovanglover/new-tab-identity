import { type MullvadServer } from '../providers/Mullvad'

const colors = ['blue', 'turquoise', 'green', 'yellow', 'orange', 'red', 'pink', 'purple', 'toolbar']

// Remove all existing containers
browser.contextualIdentities.query({}).then(async contexts => {
  for (const context of contexts) {
    await browser.contextualIdentities.remove(context.cookieStoreId)
  }

  // Add containers based on Mullvad API
  const servers: MullvadServer[] = await (await fetch('https://api-www.mullvad.net/www/relays/all/')).json()

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
browser.proxy.onRequest.addListener(async requestInfo => {
  const id = requestInfo.cookieStoreId

  if (id === undefined || id === 'firefox-default') {
    return
  }

  return {
    type: 'socks',
    host: await browser.contextualIdentities.get(id).then(context => {
      return context.name
    }).catch(err => {
      console.log(err)
    }),

    proxyDNS: true,
    port: 1080
  }
}, { urls: ['<all_urls>'] })

browser.proxy.onError.addListener(error => {
  console.error(`Proxy error: ${error.message}`)
})
