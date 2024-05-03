import { fetchJSON } from './lib/helpers'
import { MULLVAD_PUBLIC_API_URL } from './lib/Mullvad'
import { BrowserProxy } from './lib/Proxy'

const proxy = new BrowserProxy()

proxy.start()

browser.runtime.onMessage.addListener(
  async function (request) {
    if (request.contentScriptQuery === 'fetch') {
      return await fetchJSON(MULLVAD_PUBLIC_API_URL)
    }
  }
)

void (async () => {
  const permissionsToRequest = {
    origins: ['<all_urls>']
  }

  const hasPermission = await browser.permissions.contains(permissionsToRequest)

  if (!hasPermission) {
    const requestPermission = await browser.permissions.request(permissionsToRequest)

    console.log(requestPermission)
  }
})()
