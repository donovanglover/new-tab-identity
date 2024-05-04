import { useEffect, useState } from 'react'
import UpdateServerList from '../components/UpdateServerList'

export default function RootPage (): React.ReactElement {
  const [containers, setContainers] = useState<browser.contextualIdentities.ContextualIdentity[]>()

  useEffect(() => {
    browser.contextualIdentities.query({}).then((containers) => {
      setContainers(containers)
    }).catch(err => {
      console.warn(err)
    })
  }, [containers])

  return (
    <div className="p-4">
      <h1 className='text-center text-4xl font-bold'>New Tab Identity</h1>

      <UpdateServerList />

      {browser.contextualIdentities === undefined
        ? <p>Go to <code>about:config</code> and set <code>privacy.userContext.enabled</code> to <code>true</code>, then restart your browser.</p>
        : <p>All good to go.</p>
      }

      {containers?.map(container => {
        return <p key={container.cookieStoreId}>{container.name}</p>
      })}
    </div>
  )
}
