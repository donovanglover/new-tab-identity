export default function RootPage (): React.ReactElement {
  const status = browser.contextualIdentities !== undefined ? 'All good to go.' : 'browser.contextualIdentities not available.'

  const eventHandler = (event: React.MouseEvent<HTMLButtonElement>): void => {
    if (event.currentTarget.value === 'create') {
      browser.tabs.create({
        url: 'about:blank',
        cookieStoreId: '1'
      }).then().catch(e => { console.log(e) })
    }
  }

  browser.contextualIdentities.query({})
    .then((identities) => {
      console.log(identities)

      if (identities.length === 0) {
        console.log('No identities returned from the API.')
      }
    }).catch(err => {
      console.warn(err)
    })

  return (
    <div className="p-4">
      <p>{status}</p>
      <button className='text-center text-4xl font-bold' onClick={eventHandler}>New Tab Identity</button>
    </div>
  )
}
