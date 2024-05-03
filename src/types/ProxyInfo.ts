interface IProxyInfo {
  host: string
  port: number
  failoverTimeout?: number
  proxyAuthorizationHeader?: string
  connectionIsolationKey?: string
}

interface IProxyInfoDirect extends Omit<IProxyInfo, 'host' | 'port'> {
  type: 'direct'
  host?: string
  port?: number
}

interface IProxyInfoHttp extends IProxyInfo {
  type: 'http'
}

interface IProxyInfoHttps extends IProxyInfo {
  type: 'https'
}

interface IProxyInfoSocks extends IProxyInfo {
  type: 'socks'
  username?: string
  password?: string
  proxyDNS?: boolean
}

interface IProxyInfoSocks4 extends IProxyInfo {
  type: 'socks4'
  proxyDNS?: boolean
}

export type ProxyInfo = IProxyInfoDirect | IProxyInfoSocks | IProxyInfoSocks4 | IProxyInfoHttp | IProxyInfoHttps
