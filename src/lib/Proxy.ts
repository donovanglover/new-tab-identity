/* eslint-disable @typescript-eslint/no-misused-promises */

import type { ProxyListener } from '../types/ProxyListener'

interface BrowserProxyOptions {
  blockDefault?: boolean
}

export class BrowserProxy {
  readonly #options: BrowserProxyOptions

  readonly #listener: ProxyListener = async requestInfo => {
    const containerId = requestInfo.cookieStoreId

    if (containerId === undefined) {
      console.warn('Got unknown container, which should never happen.')

      return {
        type: 'direct'
      }
    }

    if (containerId === 'firefox-default') {
      return this.#options.blockDefault === true
        ? {
            type: 'http',
            host: '127.0.0.1',
            port: 65535
          }
        : {
            type: 'direct'
          }
    }

    const context = await browser.contextualIdentities.get(containerId)
    console.log(context)

    return {
      type: 'socks',
      host: context.name,
      proxyDNS: true,
      port: 1080
    }
  }

  readonly #onError = (error: Error): void => {
    console.error(`new-tab-identity(proxy-error): ${error.message}`)
  }

  /**
   * Creates a new browser proxy that listens for requests and proxies
   * based on container names.
   */
  constructor (options?: BrowserProxyOptions) {
    this.#options = options ?? {}
  }

  /**
   * Starts the BrowserProxy.
   *
   * @returns Whether or not the proxy is started.
   */
  start (): boolean {
    return this.#addRequestListener() && this.#addErrorListener()
  }

  /**
   * Stops the BrowserProxy.
   *
   * @returns Whether or not the proxy is stopped.
   */
  stop (): boolean {
    return this.#removeRequestListener() && this.#removeErrorListener()
  }

  /**
   * Adds the request listener to browser.proxy.
   *
   * @returns Whether or not the request listener was added.
   */
  #addRequestListener (): boolean {
    if (!browser.proxy.onRequest.hasListener(this.#listener)) {
      browser.proxy.onRequest.addListener(
        this.#listener,
        {
          urls: ['<all_urls>']
        }
      )
    }

    return browser.proxy.onRequest.hasListener(this.#listener)
  }

  /**
   * Adds the error listener to browser.proxy.
   *
   * @returns Whether or not the error listener was added.
   */
  #addErrorListener (): boolean {
    if (!browser.proxy.onError.hasListener(this.#onError)) {
      browser.proxy.onError.addListener(this.#onError)
    }

    return browser.proxy.onError.hasListener(this.#onError)
  }

  /**
   * Removes the request listener from browser.proxy.
   *
   * @returns Whether or not the request listener was removed.
   */
  #removeRequestListener (): boolean {
    if (browser.proxy.onRequest.hasListener(this.#listener)) {
      browser.proxy.onRequest.removeListener(this.#listener)
    }

    return !browser.proxy.onRequest.hasListener(this.#listener)
  }

  /**
   * Removes the error listener from browser.proxy.
   *
   * @returns Whether or not the error listener was removed.
   */
  #removeErrorListener (): boolean {
    if (browser.proxy.onError.hasListener(this.#onError)) {
      browser.proxy.onError.removeListener(this.#onError)
    }

    return !browser.proxy.onError.hasListener(this.#onError)
  }
}
