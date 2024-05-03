/** Listen for requests and proxy based on container
 *
 * Note: Below only works with an async function, so it's possible that
 * the upstream types are wrong.
 *
 * <https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/proxy/onRequest#addlistener_syntax>
 * <https://bugzilla.mozilla.org/show_bug.cgi?id=1409878>
 * <https://hg.mozilla.org/mozilla-central/rev/9f0ee2f582a2>
 * <https://github.com/DefinitelyTyped/DefinitelyTyped/blob/89bf9961959cf/types/firefox-webext-browser/index.d.ts#L4290-L4294>
 */
browser.proxy.onRequest.addListener(async requestInfo => { // eslint-disable-line @typescript-eslint/no-misused-promises
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
