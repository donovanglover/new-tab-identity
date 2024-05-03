import type { ProxyInfo } from './ProxyInfo'

export type ProxyListener = (requestInfo: browser.proxy._OnRequestDetails) => Promise<ProxyInfo>
