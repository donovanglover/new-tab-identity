import type { ProxyInfo } from './ProxyInfo.ts'

export type ProxyListener = (requestInfo: browser.proxy._OnRequestDetails) => Promise<ProxyInfo>
