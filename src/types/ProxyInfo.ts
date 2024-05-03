interface IProxyInfo {
  failoverTimeout?: number
  proxyAuthorizationHeader?: string
  connectionIsolationKey?: string
}

interface IProxyInfoDirect extends IProxyInfo {
  type: 'direct'
  host?: string
  port?: number
}

interface IProxyInfoNotDirect extends IProxyInfo {
  host: string
  port: number
}

interface IProxyInfoHttp extends IProxyInfoNotDirect {
  type: 'http' | 'https'
}

interface IProxyInfoSocks extends IProxyInfoNotDirect {
  type: 'socks'
  username?: string
  password?: string
  proxyDNS?: boolean
}

interface IProxyInfoSocks4 extends IProxyInfoNotDirect {
  type: 'socks4'
  proxyDNS?: boolean
}

export type ProxyInfo = IProxyInfoDirect | IProxyInfoSocks | IProxyInfoSocks4 | IProxyInfoHttp
