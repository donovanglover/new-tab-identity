import { describe, expect, it } from 'vitest'
import en from '@/public/_locales/en/messages.json'
import es from '@/public/_locales/es/messages.json'
import fr from '@/public/_locales/fr/messages.json'
import ja from '@/public/_locales/ja/messages.json'
import ko from '@/public/_locales/ko/messages.json'
import zhCN from '@/public/_locales/zh_CN/messages.json'
import manifest from '@/public/manifest.json'

interface MessageEntry {
  message: string
  description?: string
}

type Catalog = Record<string, MessageEntry>

const catalogs: Record<string, Catalog> = { en, es, fr, ja, ko, zh_CN: zhCN }

function placeholders(message: string): string[] {
  return [...new Set(message.match(/\$\d+/g) ?? [])].sort()
}

describe('locales', () => {
  it('should define the same message keys in every locale', () => {
    const keys = Object.keys(catalogs.en).sort()

    for (const catalog of Object.values(catalogs)) {
      expect(Object.keys(catalog).sort()).toEqual(keys)
    }
  })

  it('should have non-empty messages', () => {
    for (const catalog of Object.values(catalogs)) {
      for (const entry of Object.values(catalog)) {
        expect(entry.message.trim()).not.toBe('')
      }
    }
  })

  it('should use the same placeholders in every locale', () => {
    for (const key of Object.keys(catalogs.en)) {
      const expected = placeholders(catalogs.en[key].message)

      for (const catalog of Object.values(catalogs)) {
        expect(placeholders(catalog[key].message)).toEqual(expected)
      }
    }
  })

  it('should define both plural forms', () => {
    const keys = Object.keys(catalogs.en)
    const pluralBases = new Set<string>()

    for (const key of keys) {
      if (key.endsWith('_one')) {
        pluralBases.add(key.slice(0, -'_one'.length))
      }

      if (key.endsWith('_other')) {
        pluralBases.add(key.slice(0, -'_other'.length))
      }
    }

    for (const base of pluralBases) {
      expect(keys).toContain(`${base}_one`)
      expect(keys).toContain(`${base}_other`)
    }
  })
})

describe('manifest', () => {
  it('should localize manifest strings', () => {
    expect(manifest.default_locale).toBe('en')
    expect(manifest.name).toBe('__MSG_extensionName__')
    expect(manifest.description).toBe('__MSG_extensionDescription__')
    expect(manifest.browser_action.default_title).toBe('__MSG_extensionName__')
  })
})
