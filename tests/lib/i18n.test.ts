import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { catalogLocale, countryName, t, tCount } from '@/lib/i18n'

const getMessage = vi.fn<(key: string, substitutions?: string[]) => string>()
const getUILanguage = vi.fn<() => string>()

beforeEach(() => {
  getMessage.mockReset()
  getUILanguage.mockReset()
  getUILanguage.mockReturnValue('en-US')
  vi.stubGlobal('browser', { i18n: { getMessage, getUILanguage } })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('t()', () => {
  it('should return the localized message', () => {
    getMessage.mockReturnValue('Hello')

    expect(t('greeting')).toBe('Hello')
    expect(getMessage).toHaveBeenCalledWith('greeting', undefined)
  })

  it('should convert substitutions to strings', () => {
    getMessage.mockReturnValue('Hello 1')

    expect(t('greeting', ['world', 1])).toBe('Hello 1')
    expect(getMessage).toHaveBeenCalledWith('greeting', ['world', '1'])
  })

  it('should fall back to the key when the message is missing', () => {
    getMessage.mockReturnValue('')

    expect(t('missing')).toBe('missing')
  })
})

describe('tCount()', () => {
  it('should use the one form for one', () => {
    getMessage.mockReturnValue('1 server')

    expect(tCount('servers', 1)).toBe('1 server')
    expect(getMessage).toHaveBeenCalledWith('servers_one', ['1'])
  })

  it('should use the other form for zero and many', () => {
    getMessage.mockReturnValue('servers')

    expect(tCount('servers', 0)).toBe('servers')
    expect(getMessage).toHaveBeenCalledWith('servers_other', ['0'])
    expect(tCount('servers', 2)).toBe('servers')
    expect(getMessage).toHaveBeenCalledWith('servers_other', ['2'])
  })

  it('should use the French one form for zero', () => {
    getUILanguage.mockReturnValue('fr')
    getMessage.mockReturnValue('0 serveur')

    expect(tCount('servers', 0)).toBe('0 serveur')
    expect(getMessage).toHaveBeenCalledWith('servers_one', ['0'])
  })

  it('should use the other form for Japanese', () => {
    getUILanguage.mockReturnValue('ja')
    getMessage.mockReturnValue('サーバー')

    expect(tCount('servers', 1)).toBe('サーバー')
    expect(getMessage).toHaveBeenCalledWith('servers_other', ['1'])
  })

  it('should use the one form for Spanish', () => {
    getUILanguage.mockReturnValue('es')
    getMessage.mockReturnValue('1 servidor')

    expect(tCount('servers', 1)).toBe('1 servidor')
    expect(getMessage).toHaveBeenCalledWith('servers_one', ['1'])
  })

  it('should use the other form for Chinese and Korean', () => {
    getUILanguage.mockReturnValue('zh-CN')
    getMessage.mockReturnValue('服务器')

    expect(tCount('servers', 1)).toBe('服务器')
    expect(getMessage).toHaveBeenCalledWith('servers_other', ['1'])

    getUILanguage.mockReturnValue('ko')
    getMessage.mockReturnValue('서버')

    expect(tCount('servers', 1)).toBe('서버')
    expect(getMessage).toHaveBeenCalledWith('servers_other', ['1'])
  })

  it('should use English plural forms for unsupported locales', () => {
    getUILanguage.mockReturnValue('zh-TW')
    getMessage.mockReturnValue('1 server')

    expect(tCount('servers', 1)).toBe('1 server')
    expect(getMessage).toHaveBeenCalledWith('servers_one', ['1'])
  })
})

describe('catalogLocale()', () => {
  it.each([
    ['en-US', 'en'],
    ['es-419', 'es'],
    ['fr-CA', 'fr'],
    ['ja-JP', 'ja'],
    ['ko-KR', 'ko'],
    ['zh-CN', 'zh-CN'],
    ['zh-TW', 'en'],
    ['de-DE', 'en'],
  ])('should map %s to %s', (language, expected) => {
    getUILanguage.mockReturnValue(language)

    expect(catalogLocale()).toBe(expected)
  })
})

describe('countryName()', () => {
  it('should return the provider name for English', () => {
    expect(countryName('us', 'USA')).toBe('USA')
  })

  it('should return the fallback for an invalid country code', () => {
    getUILanguage.mockReturnValue('fr')

    expect(countryName('USA', 'USA')).toBe('USA')
  })

  it('should localize a country code', () => {
    getUILanguage.mockReturnValue('fr')

    expect(countryName('us', 'USA')).toBe('États-Unis')
  })

  it('should cache localized names', () => {
    getUILanguage.mockReturnValue('fr')

    expect(countryName('de', 'Germany')).toBe('Allemagne')
    expect(countryName('de', 'Germany')).toBe('Allemagne')
  })

  it('should localize Simplified Chinese', () => {
    getUILanguage.mockReturnValue('zh-CN')

    expect(countryName('ca', 'Canada')).toBe('加拿大')
  })
})
