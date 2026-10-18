/** Get a localized message, falling back to the key when it is missing.
 *
 * @param key Message key from messages.json.
 * @param substitutions Values for the `$1`, `$2`, ... placeholders.
 * @returns The localized message.
 */
export function t(key: string, substitutions?: (string | number)[]): string {
  const message = browser.i18n.getMessage(
    key,
    substitutions?.map((value) => String(value)),
  )

  return message === '' ? key : message
}

type CatalogLocale = 'en' | 'es' | 'fr' | 'ja' | 'ko' | 'zh-CN'

const languageLocales = ['en', 'es', 'fr', 'ja', 'ko'] as const
const countryCodePattern = /^[a-z]{2}$/i
const countryNameCache = new Map<string, string>()

/** Get the locale used by the extension messages and location names.
 *
 * Maps Firefox's UI locale to a locale that has a catalog, falling back to English.
 * Chinese is only supported as Simplified Chinese (`zh-CN`).
 *
 * @returns The supported catalog locale.
 */
export function catalogLocale(): CatalogLocale {
  const language = browser.i18n.getUILanguage().toLowerCase()

  if (language === 'zh-cn') {
    return 'zh-CN'
  }

  for (const locale of languageLocales) {
    if (language === locale || language.startsWith(`${locale}-`)) {
      return locale
    }
  }

  return 'en'
}

/** Get a localized display name for a country code.
 *
 * English and unsupported locales use the provider-supplied name. City names, stored
 * locations, and generated container names are never localized.
 *
 * @param code ISO 3166-1 alpha-2 country code.
 * @param fallback Country name supplied by the provider.
 * @returns The localized country name, or the fallback when unavailable.
 */
export function countryName(code: string, fallback: string): string {
  const locale = catalogLocale()

  if (locale === 'en' || !countryCodePattern.test(code)) {
    return fallback
  }

  const key = `${locale}:${code.toUpperCase()}`
  const cached = countryNameCache.get(key)

  if (cached !== undefined) {
    return cached
  }

  const name = new Intl.DisplayNames([locale], { type: 'region' }).of(code.toUpperCase()) as string

  countryNameCache.set(key, name)

  return name
}

/** Get a localized message with the plural form selected by count.
 *
 * The catalog must define `${key}_one` and `${key}_other`. Any category other than
 * `one` uses `_other`, which covers the supported locales.
 *
 * @param key Message key base from messages.json.
 * @param count Number used to choose the plural form and substituted as `$1`.
 * @returns The localized message.
 */
export function tCount(key: string, count: number): string {
  const category = new Intl.PluralRules(catalogLocale()).select(count)

  return t(`${key}_${category === 'one' ? 'one' : 'other'}`, [count])
}
