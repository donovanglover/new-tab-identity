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

/** Get a localized message with the plural form selected by count.
 *
 * The catalog must define `${key}_one` and `${key}_other`. Any category other than
 * `one` uses `_other`, which covers English, French, and Japanese.
 *
 * @param key Message key base from messages.json.
 * @param count Number used to choose the plural form and substituted as `$1`.
 * @returns The localized message.
 */
export function tCount(key: string, count: number): string {
  const category = new Intl.PluralRules(browser.i18n.getUILanguage()).select(count)

  return t(`${key}_${category === 'one' ? 'one' : 'other'}`, [count])
}
