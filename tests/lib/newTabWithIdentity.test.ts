import { describe, expect, it, vi } from 'vitest'
import { newTabWithIdentity } from '@/lib/newTabWithIdentity'

const browserMock = {
  tabs: {
    create: vi.fn<typeof browser.tabs.create>(async () => ({
      active: true,
      attention: false,
      audible: false,
      autoDiscardable: true,
      cookieStoreId: 'firefox-container-7',
      discarded: false,
      height: 947,
      hidden: false,
      highlighted: true,
      id: 5,
      incognito: false,
      index: 4,
      isArticle: undefined,
      isInReaderMode: undefined,
      lastAccessed: 1715160840455,
      mutedInfo: {
        muted: false
      },
      pinned: false,
      sharingState: {
        camera: false,
        microphone: false,
        screen: undefined
      },
      status: 'complete',
      successorTabId: -1,
      width: 1920,
      windowId: 1
    }))
  }
}

vi.stubGlobal('browser', browserMock)

const identity = {
  name: 'Work (de-ber-wg-101)',
  icon: 'briefcase',
  color: 'blue',
  iconUrl: 'resource://usercontext-content/briefcase.svg',
  colorCode: '#0000ff',
  cookieStoreId: 'firefox-container-7'
}

describe('newTabWithIdentity()', () => {
  it('should create the new tab in the identity and return it', async () => {
    const tab = await newTabWithIdentity(identity)

    expect(browserMock.tabs.create).toHaveBeenLastCalledWith({
      url: 'https://am.i.mullvad.net/connected',
      cookieStoreId: 'firefox-container-7'
    })

    expect(tab).toEqual(await browserMock.tabs.create({}))
  })

  it('should use the provided URL', async () => {
    await newTabWithIdentity(identity, 'https://example.com/')

    expect(browserMock.tabs.create).toHaveBeenLastCalledWith({
      url: 'https://example.com/',
      cookieStoreId: 'firefox-container-7'
    })
  })
})
