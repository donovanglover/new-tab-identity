const browser = window.browser

const colors = ['blue', 'turquoise', 'green', 'yellow', 'orange', 'red', 'pink', 'purple', 'toolbar']
let i = 0

// Remove all existing containers
browser.contextualIdentities.query({}).then(async contexts => {
  for (const context of contexts) {
    browser.contextualIdentities.remove(context.cookieStoreId)
  }

  // Add containers based on Mullvad API
  const servers = await (await fetch('https://api-www.mullvad.net/www/relays/all/')).json()

  servers.forEach(server => {
    const socks = server.socks_name
    console.log(server)
    if (socks) {
      browser.contextualIdentities.create({
        name: socks,
        color: colors[i++],
        icon: 'circle'
      })

      if (i === colors.length) i = 0
    }
  })
})

// Listen for requests and proxy based on container
browser.proxy.onRequest.addListener(async requestInfo => {
  const id = requestInfo.cookieStoreId
  if (id === 'firefox-default') return

  return {
    type: 'socks',
    host: await browser.contextualIdentities.get(id).then(context => {
      return context.name
    }),

    proxyDNS: true,
    port: 1080
  }
}, { urls: ['<all_urls>'] })

browser.proxy.onError.addListener(error => {
  console.error(`Proxy error: ${error.message}`)
})
