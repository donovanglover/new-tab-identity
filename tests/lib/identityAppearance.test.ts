import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  getIdentityAppearanceOptions,
  type IdentityColorOption,
  type IdentityIconOption,
} from '@/lib/identityAppearance'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('getIdentityAppearanceOptions()', () => {
  it('should use the values reported by Firefox', async () => {
    const colors: IdentityColorOption[] = [
      { color: 'cyan', colorCode: '#00c79a' },
      { color: 'violet', colorCode: '#764edd' },
    ]
    const icons: IdentityIconOption[] = [
      { icon: 'fence', iconUrl: 'resource://usercontext-content/fence.svg' },
    ]
    const getSupportedColors = vi.fn<() => Promise<IdentityColorOption[]>>(async () => colors)
    const getSupportedIcons = vi.fn<() => Promise<IdentityIconOption[]>>(async () => icons)

    vi.stubGlobal('browser', {
      contextualIdentities: {
        getSupportedColors,
        getSupportedIcons,
      },
    })

    expect(await getIdentityAppearanceOptions()).toEqual({ colors, icons })
    expect(getSupportedColors).toHaveBeenCalledOnce()
    expect(getSupportedIcons).toHaveBeenCalledOnce()
  })

  it('should propagate Firefox errors', async () => {
    vi.stubGlobal('browser', {
      contextualIdentities: {
        getSupportedColors: vi.fn<() => Promise<IdentityColorOption[]>>(async () => {
          throw new Error('disabled')
        }),
        getSupportedIcons: vi.fn<() => Promise<IdentityIconOption[]>>(async () => {
          throw new Error('disabled')
        }),
      },
    })

    await expect(getIdentityAppearanceOptions()).rejects.toThrow('disabled')
  })
})
